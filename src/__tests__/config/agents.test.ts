import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { Database } from "bun:sqlite";
import { initAgentDB, getAgents, saveAgent, deleteAgent, reorderAgents, buildAgentEnv, createDefaultAgents } from "../../bun/config/agents";
import type { AgentInstance, Provider } from "../../shared/types";

const TEST_DIR = join(import.meta.dir, ".tmp-agents");
const DB_PATH = join(TEST_DIR, "test-agents.db");

beforeEach(() => {
	if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
	mkdirSync(TEST_DIR, { recursive: true });
	initAgentDB(DB_PATH);
});

afterEach(() => {
	if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
});

describe("Agent Instance CRUD", () => {
	const makeAgent = (overrides?: Partial<AgentInstance>): AgentInstance => ({
		id: `agent-${Date.now()}-${Math.random()}`,
		name: "Test Agent",
		cli: "claude",
		providerId: "provider-1",
		createdAt: Date.now(),
		sortOrder: 0,
		...overrides,
	});

	test("empty by default", () => {
		expect(getAgents()).toEqual([]);
	});

	test("saves and retrieves agent", () => {
		const agent = makeAgent({ name: "Claude Official" });
		saveAgent(agent);
		const agents = getAgents();
		expect(agents).toHaveLength(1);
		expect(agents[0].name).toBe("Claude Official");
		expect(agents[0].cli).toBe("claude");
	});

	test("updates existing agent", () => {
		const agent = makeAgent({ name: "Old Name" });
		saveAgent(agent);
		saveAgent({ ...agent, name: "New Name" });
		const agents = getAgents();
		expect(agents).toHaveLength(1);
		expect(agents[0].name).toBe("New Name");
	});

	test("deletes agent", () => {
		const agent = makeAgent();
		saveAgent(agent);
		expect(getAgents()).toHaveLength(1);
		deleteAgent(agent.id);
		expect(getAgents()).toHaveLength(0);
	});

	test("multiple agents with different CLIs", () => {
		saveAgent(makeAgent({ id: "a1", cli: "claude", name: "Claude A", sortOrder: 0 }));
		saveAgent(makeAgent({ id: "a2", cli: "claude", name: "Claude B", sortOrder: 1 }));
		saveAgent(makeAgent({ id: "a3", cli: "codex", name: "Codex", sortOrder: 2 }));
		const agents = getAgents();
		expect(agents).toHaveLength(3);
	});

	test("reorder agents", () => {
		saveAgent(makeAgent({ id: "a1", name: "First", sortOrder: 0 }));
		saveAgent(makeAgent({ id: "a2", name: "Second", sortOrder: 1 }));
		saveAgent(makeAgent({ id: "a3", name: "Third", sortOrder: 2 }));
		reorderAgents(["a3", "a1", "a2"]);
		const agents = getAgents();
		expect(agents[0].id).toBe("a3");
		expect(agents[1].id).toBe("a1");
		expect(agents[2].id).toBe("a2");
	});

	test("stores optional fields", () => {
		const agent = makeAgent({ workDir: "/home/user/project", icon: "🚀", color: "#ff0000" });
		saveAgent(agent);
		const saved = getAgents()[0];
		expect(saved.workDir).toBe("/home/user/project");
		expect(saved.icon).toBe("🚀");
		expect(saved.color).toBe("#ff0000");
	});

	test("null optional fields", () => {
		const agent = makeAgent();
		saveAgent(agent);
		const saved = getAgents()[0];
		expect(saved.workDir).toBeNull();
		expect(saved.icon).toBeNull();
		expect(saved.color).toBeNull();
	});
});

describe("buildAgentEnv", () => {
	const makeProvider = (cli: string, overrides?: Partial<Provider>): Provider => ({
		id: "p1",
		name: "Test",
		cli: cli as any,
		apiKey: "sk-test-key",
		isActive: true,
		createdAt: Date.now(),
		...overrides,
	});

	test("claude env with API key only", () => {
		const agent: AgentInstance = { id: "a1", name: "Claude", cli: "claude", providerId: "p1", createdAt: Date.now(), sortOrder: 0 };
		const provider = makeProvider("claude");
		const env = buildAgentEnv(agent, provider);
		expect(env.ANTHROPIC_API_KEY).toBe("sk-test-key");
		expect(env.TERM).toBe("xterm-256color");
		expect(env.ANTHROPIC_BASE_URL).toBeUndefined();
	});

	test("claude env with baseUrl and model", () => {
		const agent: AgentInstance = { id: "a1", name: "Claude", cli: "claude", providerId: "p1", createdAt: Date.now(), sortOrder: 0 };
		const provider = makeProvider("claude", { baseUrl: "https://empx.example.com/v1", model: "sonnet-4" });
		const env = buildAgentEnv(agent, provider);
		expect(env.ANTHROPIC_API_KEY).toBe("sk-test-key");
		expect(env.ANTHROPIC_BASE_URL).toBe("https://empx.example.com/v1");
		expect(env.ANTHROPIC_MODEL).toBe("sonnet-4");
	});

	test("codex env", () => {
		const agent: AgentInstance = { id: "a1", name: "Codex", cli: "codex", providerId: "p1", createdAt: Date.now(), sortOrder: 0 };
		const provider = makeProvider("codex", { baseUrl: "https://custom.com/v1" });
		const env = buildAgentEnv(agent, provider);
		expect(env.OPENAI_API_KEY).toBe("sk-test-key");
		expect(env.OPENAI_BASE_URL).toBe("https://custom.com/v1");
	});

	test("gemini env", () => {
		const agent: AgentInstance = { id: "a1", name: "Gemini", cli: "gemini", providerId: "p1", createdAt: Date.now(), sortOrder: 0 };
		const provider = makeProvider("gemini");
		const env = buildAgentEnv(agent, provider);
		expect(env.GEMINI_API_KEY).toBe("sk-test-key");
	});

	test("different providers produce different envs", () => {
		const agent: AgentInstance = { id: "a1", name: "Claude", cli: "claude", providerId: "p1", createdAt: Date.now(), sortOrder: 0 };
		const p1 = makeProvider("claude", { apiKey: "key-official" });
		const p2 = makeProvider("claude", { apiKey: "key-empx", baseUrl: "https://empx.com" });
		const env1 = buildAgentEnv(agent, p1);
		const env2 = buildAgentEnv(agent, p2);
		expect(env1.ANTHROPIC_API_KEY).toBe("key-official");
		expect(env2.ANTHROPIC_API_KEY).toBe("key-empx");
		expect(env1.ANTHROPIC_BASE_URL).toBeUndefined();
		expect(env2.ANTHROPIC_BASE_URL).toBe("https://empx.com");
	});
});
