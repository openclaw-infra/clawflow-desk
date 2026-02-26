import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync, renameSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

function createGeminiHelper(home: string) {
	const GEMINI_ENV = join(home, ".gemini", ".env");

	function readGeminiEnv(): Record<string, string> {
		const result: Record<string, string> = {};
		try {
			if (existsSync(GEMINI_ENV)) {
				const content = readFileSync(GEMINI_ENV, "utf-8");
				for (const line of content.split("\n")) {
					const trimmed = line.trim();
					if (!trimmed || trimmed.startsWith("#")) continue;
					const eqIdx = trimmed.indexOf("=");
					if (eqIdx > 0) {
						const key = trimmed.slice(0, eqIdx).trim();
						let val = trimmed.slice(eqIdx + 1).trim();
						if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
							val = val.slice(1, -1);
						}
						result[key] = val;
					}
				}
			}
		} catch {}
		return result;
	}

	function writeGeminiEnv(env: Record<string, string>): void {
		const dir = join(home, ".gemini");
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
		const lines = Object.entries(env).map(([k, v]) => `${k}="${v}"`);
		const tmp = GEMINI_ENV + ".tmp";
		writeFileSync(tmp, lines.join("\n") + "\n");
		renameSync(tmp, GEMINI_ENV);
	}

	function setGeminiProvider(apiKey: string, baseUrl?: string, model?: string): void {
		const env = readGeminiEnv();
		env.GEMINI_API_KEY = apiKey;
		if (baseUrl) env.GOOGLE_GEMINI_BASE_URL = baseUrl;
		if (model) env.GEMINI_MODEL = model;
		writeGeminiEnv(env);
	}

	function getGeminiActiveKey(): string | undefined {
		const env = readGeminiEnv();
		return env.GEMINI_API_KEY || env.GOOGLE_GEMINI_API_KEY;
	}

	function isGeminiInstalled(): boolean {
		return existsSync(join(home, ".gemini"));
	}

	return { readGeminiEnv, writeGeminiEnv, setGeminiProvider, getGeminiActiveKey, isGeminiInstalled, GEMINI_ENV };
}

describe("Gemini config", () => {
	let tmpHome: string;
	let helper: ReturnType<typeof createGeminiHelper>;

	beforeEach(() => {
		tmpHome = mkdtempSync(join(tmpdir(), "gemini-test-"));
		helper = createGeminiHelper(tmpHome);
	});

	afterEach(() => {
		rmSync(tmpHome, { recursive: true, force: true });
	});

	describe("readGeminiEnv", () => {
		test("returns empty object when no .env file", () => {
			expect(helper.readGeminiEnv()).toEqual({});
		});

		test("parses key=value pairs", () => {
			const dir = join(tmpHome, ".gemini");
			mkdirSync(dir, { recursive: true });
			writeFileSync(helper.GEMINI_ENV, 'GEMINI_API_KEY="test-key"\nGEMINI_MODEL="gemini-pro"\n');
			const env = helper.readGeminiEnv();
			expect(env.GEMINI_API_KEY).toBe("test-key");
			expect(env.GEMINI_MODEL).toBe("gemini-pro");
		});

		test("strips double quotes", () => {
			const dir = join(tmpHome, ".gemini");
			mkdirSync(dir, { recursive: true });
			writeFileSync(helper.GEMINI_ENV, 'KEY="value"\n');
			expect(helper.readGeminiEnv().KEY).toBe("value");
		});

		test("strips single quotes", () => {
			const dir = join(tmpHome, ".gemini");
			mkdirSync(dir, { recursive: true });
			writeFileSync(helper.GEMINI_ENV, "KEY='value'\n");
			expect(helper.readGeminiEnv().KEY).toBe("value");
		});

		test("handles unquoted values", () => {
			const dir = join(tmpHome, ".gemini");
			mkdirSync(dir, { recursive: true });
			writeFileSync(helper.GEMINI_ENV, "KEY=value\n");
			expect(helper.readGeminiEnv().KEY).toBe("value");
		});

		test("skips comments and empty lines", () => {
			const dir = join(tmpHome, ".gemini");
			mkdirSync(dir, { recursive: true });
			writeFileSync(helper.GEMINI_ENV, "# comment\n\nKEY=val\n# another\n");
			const env = helper.readGeminiEnv();
			expect(Object.keys(env)).toEqual(["KEY"]);
			expect(env.KEY).toBe("val");
		});

		test("handles = in value", () => {
			const dir = join(tmpHome, ".gemini");
			mkdirSync(dir, { recursive: true });
			writeFileSync(helper.GEMINI_ENV, "KEY=abc=def\n");
			expect(helper.readGeminiEnv().KEY).toBe("abc=def");
		});
	});

	describe("writeGeminiEnv", () => {
		test("creates directory and writes .env", () => {
			helper.writeGeminiEnv({ GEMINI_API_KEY: "key123" });
			expect(existsSync(helper.GEMINI_ENV)).toBe(true);
			const content = readFileSync(helper.GEMINI_ENV, "utf-8");
			expect(content).toContain('GEMINI_API_KEY="key123"');
		});

		test("writes multiple entries", () => {
			helper.writeGeminiEnv({ A: "1", B: "2" });
			const content = readFileSync(helper.GEMINI_ENV, "utf-8");
			expect(content).toContain('A="1"');
			expect(content).toContain('B="2"');
		});

		test("overwrites existing file", () => {
			helper.writeGeminiEnv({ OLD: "data" });
			helper.writeGeminiEnv({ NEW: "data" });
			const content = readFileSync(helper.GEMINI_ENV, "utf-8");
			expect(content).not.toContain("OLD");
			expect(content).toContain('NEW="data"');
		});
	});

	describe("setGeminiProvider", () => {
		test("sets API key", () => {
			helper.setGeminiProvider("gem-key");
			const env = helper.readGeminiEnv();
			expect(env.GEMINI_API_KEY).toBe("gem-key");
		});

		test("sets baseUrl and model when provided", () => {
			helper.setGeminiProvider("gem-key", "https://proxy.example.com", "gemini-2.0");
			const env = helper.readGeminiEnv();
			expect(env.GOOGLE_GEMINI_BASE_URL).toBe("https://proxy.example.com");
			expect(env.GEMINI_MODEL).toBe("gemini-2.0");
		});

		test("preserves existing env vars", () => {
			helper.writeGeminiEnv({ EXISTING: "keep" });
			helper.setGeminiProvider("new-key");
			const env = helper.readGeminiEnv();
			expect(env.EXISTING).toBe("keep");
			expect(env.GEMINI_API_KEY).toBe("new-key");
		});

		test("does not set baseUrl/model when undefined", () => {
			helper.setGeminiProvider("gem-key");
			const env = helper.readGeminiEnv();
			expect(env.GOOGLE_GEMINI_BASE_URL).toBeUndefined();
			expect(env.GEMINI_MODEL).toBeUndefined();
		});
	});

	describe("getGeminiActiveKey", () => {
		test("returns undefined when no env", () => {
			expect(helper.getGeminiActiveKey()).toBeUndefined();
		});

		test("returns GEMINI_API_KEY", () => {
			helper.writeGeminiEnv({ GEMINI_API_KEY: "my-key" });
			expect(helper.getGeminiActiveKey()).toBe("my-key");
		});

		test("falls back to GOOGLE_GEMINI_API_KEY", () => {
			helper.writeGeminiEnv({ GOOGLE_GEMINI_API_KEY: "google-key" });
			expect(helper.getGeminiActiveKey()).toBe("google-key");
		});
	});

	describe("isGeminiInstalled", () => {
		test("returns false when .gemini dir missing", () => {
			expect(helper.isGeminiInstalled()).toBe(false);
		});

		test("returns true when .gemini dir exists", () => {
			mkdirSync(join(tmpHome, ".gemini"), { recursive: true });
			expect(helper.isGeminiInstalled()).toBe(true);
		});
	});
});
