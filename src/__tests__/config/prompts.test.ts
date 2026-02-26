import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync, renameSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("Prompts management", () => {
	let tempHome: string;

	beforeEach(() => {
		tempHome = mkdtempSync(join(tmpdir(), "clawflow-prompts-"));
	});

	afterEach(() => {
		rmSync(tempHome, { recursive: true, force: true });
	});

	test("reads CLAUDE.md when exists", () => {
		const dir = join(tempHome, ".claude");
		mkdirSync(dir, { recursive: true });
		const path = join(dir, "CLAUDE.md");
		writeFileSync(path, "# My Claude Prompt\n\nBe helpful.");

		const content = readFileSync(path, "utf-8");
		expect(content).toContain("# My Claude Prompt");
		expect(content).toContain("Be helpful.");
	});

	test("returns empty when file does not exist", () => {
		const path = join(tempHome, ".claude", "CLAUDE.md");
		expect(existsSync(path)).toBe(false);
	});

	test("creates prompt file with atomic write", () => {
		const dir = join(tempHome, ".codex");
		mkdirSync(dir, { recursive: true });
		const path = join(dir, "AGENTS.md");
		const content = "# Codex Agent\n\nFollow these rules.";

		const tmp = path + ".tmp";
		writeFileSync(tmp, content);
		renameSync(tmp, path);

		expect(readFileSync(path, "utf-8")).toBe(content);
		expect(existsSync(tmp)).toBe(false);
	});

	test("overwrites existing prompt file", () => {
		const dir = join(tempHome, ".gemini");
		mkdirSync(dir, { recursive: true });
		const path = join(dir, "GEMINI.md");

		writeFileSync(path, "old content");
		expect(readFileSync(path, "utf-8")).toBe("old content");

		const tmp = path + ".tmp";
		writeFileSync(tmp, "new content");
		renameSync(tmp, path);

		expect(readFileSync(path, "utf-8")).toBe("new content");
	});

	test("creates parent directory if missing", () => {
		const dir = join(tempHome, ".claude");
		expect(existsSync(dir)).toBe(false);

		mkdirSync(dir, { recursive: true });
		const path = join(dir, "CLAUDE.md");
		writeFileSync(path, "# Test");

		expect(existsSync(path)).toBe(true);
		expect(readFileSync(path, "utf-8")).toBe("# Test");
	});

	test("handles large prompt files", () => {
		const dir = join(tempHome, ".claude");
		mkdirSync(dir, { recursive: true });
		const path = join(dir, "CLAUDE.md");

		const largeContent = "# Rules\n\n" + "- Rule line\n".repeat(1000);
		writeFileSync(path, largeContent);

		const content = readFileSync(path, "utf-8");
		expect(content.split("\n").length).toBeGreaterThan(1000);
	});

	test("preserves unicode content", () => {
		const dir = join(tempHome, ".claude");
		mkdirSync(dir, { recursive: true });
		const path = join(dir, "CLAUDE.md");

		const content = "# 提示词\n\n你是一个有用的助手。\n\n🚀 emoji support";
		writeFileSync(path, content);

		expect(readFileSync(path, "utf-8")).toBe(content);
	});
});
