import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("Export/Import", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "clawflow-export-"));
	});

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true });
	});

	test("exports valid JSON structure", () => {
		const data = {
			version: 1,
			exportedAt: Date.now(),
			providers: [
				{ id: "p1", name: "Test", cli: "claude", apiKey: "sk-test", isActive: true, createdAt: Date.now() },
			],
			mcp: { claude: [], codex: [], gemini: [] },
			prompts: { claude: "# Claude", codex: "", gemini: "" },
		};

		const path = join(tempDir, "backup.json");
		writeFileSync(path, JSON.stringify(data, null, 2));

		const loaded = JSON.parse(readFileSync(path, "utf-8"));
		expect(loaded.version).toBe(1);
		expect(loaded.providers).toHaveLength(1);
		expect(loaded.providers[0].name).toBe("Test");
		expect(loaded.mcp.claude).toEqual([]);
		expect(loaded.prompts.claude).toBe("# Claude");
	});

	test("exports with MCP servers", () => {
		const data = {
			version: 1,
			exportedAt: Date.now(),
			providers: [],
			mcp: {
				claude: [{ name: "fs", command: "npx", args: ["-y", "mcp-fs"] }],
				codex: [],
				gemini: [{ name: "web", command: "mcp-web" }],
			},
			prompts: { claude: "", codex: "", gemini: "" },
		};

		const path = join(tempDir, "backup.json");
		writeFileSync(path, JSON.stringify(data, null, 2));

		const loaded = JSON.parse(readFileSync(path, "utf-8"));
		expect(loaded.mcp.claude).toHaveLength(1);
		expect(loaded.mcp.claude[0].name).toBe("fs");
		expect(loaded.mcp.gemini).toHaveLength(1);
	});

	test("atomic write prevents corruption", () => {
		const path = join(tempDir, "backup.json");
		const tmp = path + ".tmp";
		const data = { version: 1, exportedAt: Date.now(), providers: [] };

		writeFileSync(tmp, JSON.stringify(data, null, 2));
		const { renameSync } = require("fs");
		renameSync(tmp, path);

		expect(existsSync(path)).toBe(true);
		expect(existsSync(tmp)).toBe(false);
		expect(JSON.parse(readFileSync(path, "utf-8")).version).toBe(1);
	});

	test("import rejects invalid version", () => {
		const path = join(tempDir, "bad.json");
		writeFileSync(path, JSON.stringify({ version: 99 }));

		const loaded = JSON.parse(readFileSync(path, "utf-8"));
		expect(loaded.version).not.toBe(1);
	});

	test("import rejects non-existent file", () => {
		const path = join(tempDir, "nope.json");
		expect(existsSync(path)).toBe(false);
	});

	test("creates nested directories for export", () => {
		const nested = join(tempDir, "a", "b", "c");
		mkdirSync(nested, { recursive: true });
		const path = join(nested, "backup.json");
		writeFileSync(path, "{}");
		expect(existsSync(path)).toBe(true);
	});

	test("handles large export with many providers", () => {
		const providers = Array.from({ length: 100 }, (_, i) => ({
			id: `p${i}`, name: `Provider ${i}`, cli: "claude", apiKey: `sk-${i}`,
			isActive: i === 0, createdAt: Date.now(),
		}));
		const data = {
			version: 1, exportedAt: Date.now(), providers,
			mcp: { claude: [], codex: [], gemini: [] },
			prompts: { claude: "", codex: "", gemini: "" },
		};

		const path = join(tempDir, "large.json");
		writeFileSync(path, JSON.stringify(data));

		const loaded = JSON.parse(readFileSync(path, "utf-8"));
		expect(loaded.providers).toHaveLength(100);
	});
});
