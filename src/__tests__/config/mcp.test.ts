import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("MCP config - Claude format", () => {
	let tempHome: string;
	let mcpPath: string;

	beforeEach(() => {
		tempHome = mkdtempSync(join(tmpdir(), "clawflow-mcp-"));
		mcpPath = join(tempHome, ".claude.json");
	});

	afterEach(() => {
		rmSync(tempHome, { recursive: true, force: true });
	});

	test("reads empty when no file", () => {
		expect(existsSync(mcpPath)).toBe(false);
	});

	test("reads mcpServers from JSON", () => {
		const data = {
			mcpServers: {
				filesystem: { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"] },
				github: { command: "gh-mcp", env: { GITHUB_TOKEN: "ghp_test" } },
			},
		};
		writeFileSync(mcpPath, JSON.stringify(data));

		const content = JSON.parse(readFileSync(mcpPath, "utf-8"));
		const servers = Object.entries(content.mcpServers);
		expect(servers).toHaveLength(2);
		expect(content.mcpServers.filesystem.command).toBe("npx");
		expect(content.mcpServers.filesystem.args).toEqual(["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]);
		expect(content.mcpServers.github.env.GITHUB_TOKEN).toBe("ghp_test");
	});

	test("adds a new MCP server", () => {
		const data = { mcpServers: { existing: { command: "test" } } };
		writeFileSync(mcpPath, JSON.stringify(data));

		const content = JSON.parse(readFileSync(mcpPath, "utf-8"));
		content.mcpServers.newserver = { command: "npx", args: ["-y", "new-server"] };
		writeFileSync(mcpPath, JSON.stringify(content, null, 2));

		const updated = JSON.parse(readFileSync(mcpPath, "utf-8"));
		expect(Object.keys(updated.mcpServers)).toHaveLength(2);
		expect(updated.mcpServers.newserver.command).toBe("npx");
	});

	test("deletes an MCP server", () => {
		const data = { mcpServers: { a: { command: "a" }, b: { command: "b" } } };
		writeFileSync(mcpPath, JSON.stringify(data));

		const content = JSON.parse(readFileSync(mcpPath, "utf-8"));
		delete content.mcpServers.a;
		writeFileSync(mcpPath, JSON.stringify(content, null, 2));

		const updated = JSON.parse(readFileSync(mcpPath, "utf-8"));
		expect(Object.keys(updated.mcpServers)).toHaveLength(1);
		expect(updated.mcpServers.b).toBeDefined();
	});

	test("toggles disabled flag", () => {
		const data = { mcpServers: { srv: { command: "test" } } };
		writeFileSync(mcpPath, JSON.stringify(data));

		const content = JSON.parse(readFileSync(mcpPath, "utf-8"));
		content.mcpServers.srv.disabled = true;
		writeFileSync(mcpPath, JSON.stringify(content, null, 2));

		const updated = JSON.parse(readFileSync(mcpPath, "utf-8"));
		expect(updated.mcpServers.srv.disabled).toBe(true);
	});

	test("preserves non-MCP fields", () => {
		const data = { mcpServers: { srv: { command: "test" } }, otherField: "keep" };
		writeFileSync(mcpPath, JSON.stringify(data));

		const content = JSON.parse(readFileSync(mcpPath, "utf-8"));
		content.mcpServers.srv2 = { command: "new" };
		writeFileSync(mcpPath, JSON.stringify(content, null, 2));

		const updated = JSON.parse(readFileSync(mcpPath, "utf-8"));
		expect(updated.otherField).toBe("keep");
	});
});

describe("MCP config - Gemini format", () => {
	let tempHome: string;
	let settingsPath: string;

	beforeEach(() => {
		tempHome = mkdtempSync(join(tmpdir(), "clawflow-mcp-gemini-"));
		const geminiDir = join(tempHome, ".gemini");
		mkdirSync(geminiDir, { recursive: true });
		settingsPath = join(geminiDir, "settings.json");
	});

	afterEach(() => {
		rmSync(tempHome, { recursive: true, force: true });
	});

	test("reads mcpServers from settings.json", () => {
		const data = {
			mcpServers: {
				myserver: { command: "node", args: ["server.js"] },
			},
		};
		writeFileSync(settingsPath, JSON.stringify(data));

		const content = JSON.parse(readFileSync(settingsPath, "utf-8"));
		expect(content.mcpServers.myserver.command).toBe("node");
	});
});
