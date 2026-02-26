import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync, renameSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

function createCodexHelper(home: string) {
	const CODEX_AUTH = join(home, ".codex", "auth.json");
	const CODEX_CONFIG = join(home, ".codex", "config.toml");

	function readCodexAuth(): Record<string, any> {
		try {
			if (existsSync(CODEX_AUTH)) {
				return JSON.parse(readFileSync(CODEX_AUTH, "utf-8"));
			}
		} catch {}
		return {};
	}

	function writeCodexAuth(config: Record<string, any>): void {
		const dir = join(home, ".codex");
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
		const tmp = CODEX_AUTH + ".tmp";
		writeFileSync(tmp, JSON.stringify(config, null, 2));
		renameSync(tmp, CODEX_AUTH);
	}

	function setCodexProvider(apiKey: string, baseUrl?: string, model?: string): void {
		const auth = readCodexAuth();
		auth.OPENAI_API_KEY = apiKey;
		if (baseUrl) auth.OPENAI_BASE_URL = baseUrl;
		writeCodexAuth(auth);

		if (model && existsSync(CODEX_CONFIG)) {
			try {
				let toml = readFileSync(CODEX_CONFIG, "utf-8");
				if (toml.includes("model =")) {
					toml = toml.replace(/model\s*=\s*"[^"]*"/, `model = "${model}"`);
				}
				writeFileSync(CODEX_CONFIG, toml);
			} catch {}
		}
	}

	function getCodexActiveKey(): string | undefined {
		const auth = readCodexAuth();
		return auth?.OPENAI_API_KEY;
	}

	function isCodexInstalled(): boolean {
		return existsSync(join(home, ".codex"));
	}

	return { readCodexAuth, writeCodexAuth, setCodexProvider, getCodexActiveKey, isCodexInstalled, CODEX_AUTH, CODEX_CONFIG };
}

describe("Codex config", () => {
	let tmpHome: string;
	let helper: ReturnType<typeof createCodexHelper>;

	beforeEach(() => {
		tmpHome = mkdtempSync(join(tmpdir(), "codex-test-"));
		helper = createCodexHelper(tmpHome);
	});

	afterEach(() => {
		rmSync(tmpHome, { recursive: true, force: true });
	});

	describe("readCodexAuth", () => {
		test("returns empty object when no auth file", () => {
			expect(helper.readCodexAuth()).toEqual({});
		});

		test("reads existing auth file", () => {
			const dir = join(tmpHome, ".codex");
			mkdirSync(dir, { recursive: true });
			writeFileSync(helper.CODEX_AUTH, JSON.stringify({ OPENAI_API_KEY: "sk-test" }));
			expect(helper.readCodexAuth().OPENAI_API_KEY).toBe("sk-test");
		});

		test("returns empty object on invalid JSON", () => {
			const dir = join(tmpHome, ".codex");
			mkdirSync(dir, { recursive: true });
			writeFileSync(helper.CODEX_AUTH, "broken{json");
			expect(helper.readCodexAuth()).toEqual({});
		});
	});

	describe("writeCodexAuth", () => {
		test("creates directory and writes auth", () => {
			helper.writeCodexAuth({ OPENAI_API_KEY: "sk-123" });
			expect(existsSync(helper.CODEX_AUTH)).toBe(true);
			const content = JSON.parse(readFileSync(helper.CODEX_AUTH, "utf-8"));
			expect(content.OPENAI_API_KEY).toBe("sk-123");
		});

		test("overwrites existing auth", () => {
			helper.writeCodexAuth({ old: "data" });
			helper.writeCodexAuth({ new: "data" });
			const content = JSON.parse(readFileSync(helper.CODEX_AUTH, "utf-8"));
			expect(content.new).toBe("data");
			expect(content.old).toBeUndefined();
		});
	});

	describe("setCodexProvider", () => {
		test("sets API key in auth", () => {
			helper.setCodexProvider("sk-abc");
			const auth = helper.readCodexAuth();
			expect(auth.OPENAI_API_KEY).toBe("sk-abc");
		});

		test("sets baseUrl when provided", () => {
			helper.setCodexProvider("sk-abc", "https://proxy.example.com");
			const auth = helper.readCodexAuth();
			expect(auth.OPENAI_BASE_URL).toBe("https://proxy.example.com");
		});

		test("preserves existing auth keys", () => {
			helper.writeCodexAuth({ EXISTING: "keep" });
			helper.setCodexProvider("sk-new");
			const auth = helper.readCodexAuth();
			expect(auth.EXISTING).toBe("keep");
			expect(auth.OPENAI_API_KEY).toBe("sk-new");
		});

		test("updates model in config.toml when file exists", () => {
			const dir = join(tmpHome, ".codex");
			mkdirSync(dir, { recursive: true });
			writeFileSync(helper.CODEX_CONFIG, '[settings]\nmodel = "gpt-4"\ntimeout = 30\n');
			helper.setCodexProvider("sk-abc", undefined, "o3-mini");
			const toml = readFileSync(helper.CODEX_CONFIG, "utf-8");
			expect(toml).toContain('model = "o3-mini"');
			expect(toml).toContain("timeout = 30");
		});

		test("does not crash when config.toml missing and model provided", () => {
			expect(() => helper.setCodexProvider("sk-abc", undefined, "o3-mini")).not.toThrow();
		});
	});

	describe("getCodexActiveKey", () => {
		test("returns undefined when no auth", () => {
			expect(helper.getCodexActiveKey()).toBeUndefined();
		});

		test("returns OPENAI_API_KEY", () => {
			helper.writeCodexAuth({ OPENAI_API_KEY: "sk-key" });
			expect(helper.getCodexActiveKey()).toBe("sk-key");
		});
	});

	describe("isCodexInstalled", () => {
		test("returns false when .codex dir missing", () => {
			expect(helper.isCodexInstalled()).toBe(false);
		});

		test("returns true when .codex dir exists", () => {
			mkdirSync(join(tmpHome, ".codex"), { recursive: true });
			expect(helper.isCodexInstalled()).toBe(true);
		});
	});
});
