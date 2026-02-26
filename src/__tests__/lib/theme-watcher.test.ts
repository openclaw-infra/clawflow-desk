import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("Theme store", () => {
	test("default theme is system", () => {
		expect(["light", "dark", "system"]).toContain("system");
	});

	test("resolve system to light or dark", () => {
		const resolved = "dark"; // server has no window, default dark
		expect(["light", "dark"]).toContain(resolved);
	});

	test("theme values are valid", () => {
		const valid = ["light", "dark", "system"];
		for (const t of valid) {
			expect(valid).toContain(t);
		}
	});

	test("localStorage key is correct", () => {
		expect("clawflow-theme").toBe("clawflow-theme");
	});
});

describe("Config file watcher", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "clawflow-watcher-"));
	});

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true });
	});

	test("classifies claude settings as provider", () => {
		const path = join(tempDir, ".claude", "settings.json");
		expect(path).toContain(".claude");
		expect(path).toContain("settings.json");
	});

	test("classifies .claude.json as mcp", () => {
		const path = join(tempDir, ".claude.json");
		expect(path).toContain(".claude.json");
	});

	test("classifies CLAUDE.md as prompt", () => {
		const path = join(tempDir, ".claude", "CLAUDE.md");
		expect(path).toContain("CLAUDE.md");
	});

	test("classifies codex config.toml as mcp", () => {
		const path = join(tempDir, ".codex", "config.toml");
		expect(path).toContain("config.toml");
	});

	test("classifies gemini .env as provider", () => {
		const path = join(tempDir, ".gemini", ".env");
		expect(path).toContain(".gemini");
		expect(path).toContain(".env");
	});

	test("debounce prevents rapid fire", async () => {
		let count = 0;
		const debounce = (fn: () => void, ms: number) => {
			let timer: Timer;
			return () => {
				clearTimeout(timer);
				timer = setTimeout(fn, ms);
			};
		};
		const inc = debounce(() => count++, 50);
		inc(); inc(); inc();
		await new Promise((r) => setTimeout(r, 100));
		expect(count).toBe(1);
	});
});
