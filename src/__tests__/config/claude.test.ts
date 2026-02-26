import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

// We replicate the claude.ts logic with a configurable HOME to avoid touching real ~/.claude
function createClaudeHelper(home: string) {
	const CLAUDE_SETTINGS = join(home, ".claude", "settings.json");

	function readClaudeConfig(): Record<string, any> {
		try {
			if (existsSync(CLAUDE_SETTINGS)) {
				return JSON.parse(readFileSync(CLAUDE_SETTINGS, "utf-8"));
			}
		} catch {}
		return {};
	}

	function writeClaudeConfig(config: Record<string, any>): void {
		const dir = join(home, ".claude");
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
		const tmp = CLAUDE_SETTINGS + ".tmp";
		writeFileSync(tmp, JSON.stringify(config, null, 2));
		const { renameSync } = require("fs");
		renameSync(tmp, CLAUDE_SETTINGS);
	}

	function setClaudeProvider(apiKey: string, baseUrl?: string, model?: string): void {
		const config = readClaudeConfig();
		if (!config.env) config.env = {};
		config.env.ANTHROPIC_API_KEY = apiKey;
		if (baseUrl) config.env.ANTHROPIC_BASE_URL = baseUrl;
		if (model) config.env.CLAUDE_MODEL = model;
		writeClaudeConfig(config);
	}

	function getClaudeActiveKey(): string | undefined {
		const config = readClaudeConfig();
		return config?.env?.ANTHROPIC_API_KEY || config?.env?.ANTHROPIC_AUTH_TOKEN;
	}

	function isClaudeInstalled(): boolean {
		return existsSync(join(home, ".claude"));
	}

	return { readClaudeConfig, writeClaudeConfig, setClaudeProvider, getClaudeActiveKey, isClaudeInstalled, CLAUDE_SETTINGS };
}

describe("Claude config", () => {
	let tmpHome: string;
	let helper: ReturnType<typeof createClaudeHelper>;

	beforeEach(() => {
		tmpHome = mkdtempSync(join(tmpdir(), "claude-test-"));
		helper = createClaudeHelper(tmpHome);
	});

	afterEach(() => {
		rmSync(tmpHome, { recursive: true, force: true });
	});

	describe("readClaudeConfig", () => {
		test("returns empty object when no config exists", () => {
			expect(helper.readClaudeConfig()).toEqual({});
		});

		test("reads existing config", () => {
			const dir = join(tmpHome, ".claude");
			mkdirSync(dir, { recursive: true });
			writeFileSync(helper.CLAUDE_SETTINGS, JSON.stringify({ env: { ANTHROPIC_API_KEY: "test-key" } }));
			const config = helper.readClaudeConfig();
			expect(config.env.ANTHROPIC_API_KEY).toBe("test-key");
		});

		test("returns empty object on invalid JSON", () => {
			const dir = join(tmpHome, ".claude");
			mkdirSync(dir, { recursive: true });
			writeFileSync(helper.CLAUDE_SETTINGS, "not json{{{");
			expect(helper.readClaudeConfig()).toEqual({});
		});
	});

	describe("writeClaudeConfig", () => {
		test("creates directory and writes config", () => {
			helper.writeClaudeConfig({ env: { KEY: "val" } });
			expect(existsSync(helper.CLAUDE_SETTINGS)).toBe(true);
			const content = JSON.parse(readFileSync(helper.CLAUDE_SETTINGS, "utf-8"));
			expect(content.env.KEY).toBe("val");
		});

		test("overwrites existing config", () => {
			helper.writeClaudeConfig({ a: 1 });
			helper.writeClaudeConfig({ b: 2 });
			const content = JSON.parse(readFileSync(helper.CLAUDE_SETTINGS, "utf-8"));
			expect(content.b).toBe(2);
			expect(content.a).toBeUndefined();
		});
	});

	describe("setClaudeProvider", () => {
		test("sets API key", () => {
			helper.setClaudeProvider("sk-abc");
			const config = helper.readClaudeConfig();
			expect(config.env.ANTHROPIC_API_KEY).toBe("sk-abc");
		});

		test("sets baseUrl and model when provided", () => {
			helper.setClaudeProvider("sk-abc", "https://proxy.example.com", "claude-4");
			const config = helper.readClaudeConfig();
			expect(config.env.ANTHROPIC_BASE_URL).toBe("https://proxy.example.com");
			expect(config.env.CLAUDE_MODEL).toBe("claude-4");
		});

		test("preserves existing config keys", () => {
			helper.writeClaudeConfig({ env: { EXISTING: "keep" }, other: true });
			helper.setClaudeProvider("sk-new");
			const config = helper.readClaudeConfig();
			expect(config.env.EXISTING).toBe("keep");
			expect(config.other).toBe(true);
			expect(config.env.ANTHROPIC_API_KEY).toBe("sk-new");
		});

		test("does not set baseUrl/model when undefined", () => {
			helper.setClaudeProvider("sk-abc");
			const config = helper.readClaudeConfig();
			expect(config.env.ANTHROPIC_BASE_URL).toBeUndefined();
			expect(config.env.CLAUDE_MODEL).toBeUndefined();
		});
	});

	describe("getClaudeActiveKey", () => {
		test("returns undefined when no config", () => {
			expect(helper.getClaudeActiveKey()).toBeUndefined();
		});

		test("returns ANTHROPIC_API_KEY", () => {
			helper.writeClaudeConfig({ env: { ANTHROPIC_API_KEY: "my-key" } });
			expect(helper.getClaudeActiveKey()).toBe("my-key");
		});

		test("falls back to ANTHROPIC_AUTH_TOKEN", () => {
			helper.writeClaudeConfig({ env: { ANTHROPIC_AUTH_TOKEN: "token-key" } });
			expect(helper.getClaudeActiveKey()).toBe("token-key");
		});
	});

	describe("isClaudeInstalled", () => {
		test("returns false when .claude dir missing", () => {
			expect(helper.isClaudeInstalled()).toBe(false);
		});

		test("returns true when .claude dir exists", () => {
			mkdirSync(join(tmpHome, ".claude"), { recursive: true });
			expect(helper.isClaudeInstalled()).toBe(true);
		});
	});
});
