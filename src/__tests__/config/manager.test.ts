import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { Database } from "bun:sqlite";

describe("ConfigManager SQLite", () => {
	let tempDir: string;
	let dbPath: string;
	let db: Database;

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "clawflow-db-"));
		dbPath = join(tempDir, "test.db");
		db = new Database(dbPath);
		db.run(`
			CREATE TABLE IF NOT EXISTS providers (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				cli TEXT NOT NULL,
				apiKey TEXT NOT NULL,
				baseUrl TEXT,
				model TEXT,
				isActive INTEGER DEFAULT 0,
				createdAt INTEGER NOT NULL
			)
		`);
	});

	afterEach(() => {
		db.close();
		rmSync(tempDir, { recursive: true, force: true });
	});

	test("creates database and table", () => {
		expect(existsSync(dbPath)).toBe(true);
		const tables = db.query("SELECT name FROM sqlite_master WHERE type='table'").all() as any[];
		expect(tables.map((t) => t.name)).toContain("providers");
	});

	test("inserts a provider", () => {
		db.run(
			"INSERT INTO providers (id, name, cli, apiKey, baseUrl, model, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			["p1", "Test Provider", "claude", "sk-ant-test", null, null, 0, Date.now()]
		);

		const rows = db.query("SELECT * FROM providers").all() as any[];
		expect(rows).toHaveLength(1);
		expect(rows[0].name).toBe("Test Provider");
		expect(rows[0].cli).toBe("claude");
	});

	test("updates a provider", () => {
		const now = Date.now();
		db.run(
			"INSERT INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
			["p1", "Original", "claude", "sk-old", 0, now]
		);

		db.run(
			"INSERT OR REPLACE INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
			["p1", "Updated", "claude", "sk-new", 1, now]
		);

		const rows = db.query("SELECT * FROM providers").all() as any[];
		expect(rows).toHaveLength(1);
		expect(rows[0].name).toBe("Updated");
		expect(rows[0].apiKey).toBe("sk-new");
		expect(rows[0].isActive).toBe(1);
	});

	test("deletes a provider", () => {
		db.run(
			"INSERT INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
			["p1", "ToDelete", "codex", "sk-del", 0, Date.now()]
		);

		db.run("DELETE FROM providers WHERE id = ?", ["p1"]);
		const rows = db.query("SELECT * FROM providers").all();
		expect(rows).toHaveLength(0);
	});

	test("filters providers by CLI", () => {
		const now = Date.now();
		db.run("INSERT INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)", ["p1", "Claude A", "claude", "sk-1", 0, now]);
		db.run("INSERT INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)", ["p2", "Codex A", "codex", "sk-2", 0, now]);
		db.run("INSERT INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)", ["p3", "Claude B", "claude", "sk-3", 0, now]);

		const claudeProviders = db.query("SELECT * FROM providers WHERE cli = ?").all("claude") as any[];
		expect(claudeProviders).toHaveLength(2);

		const codexProviders = db.query("SELECT * FROM providers WHERE cli = ?").all("codex") as any[];
		expect(codexProviders).toHaveLength(1);
	});

	test("activates provider and deactivates others", () => {
		const now = Date.now();
		db.run("INSERT INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)", ["p1", "A", "claude", "sk-1", 1, now]);
		db.run("INSERT INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)", ["p2", "B", "claude", "sk-2", 0, now]);
		db.run("INSERT INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)", ["p3", "C", "codex", "sk-3", 1, now]);

		// Activate p2 for claude
		db.run("UPDATE providers SET isActive = 0 WHERE cli = ?", ["claude"]);
		db.run("UPDATE providers SET isActive = 1 WHERE id = ?", ["p2"]);

		const p1 = db.query("SELECT isActive FROM providers WHERE id = ?").get("p1") as any;
		const p2 = db.query("SELECT isActive FROM providers WHERE id = ?").get("p2") as any;
		const p3 = db.query("SELECT isActive FROM providers WHERE id = ?").get("p3") as any;

		expect(p1.isActive).toBe(0);
		expect(p2.isActive).toBe(1);
		expect(p3.isActive).toBe(1); // codex untouched
	});

	test("gets active provider for CLI", () => {
		const now = Date.now();
		db.run("INSERT INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)", ["p1", "Active", "gemini", "key-1", 1, now]);
		db.run("INSERT INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)", ["p2", "Inactive", "gemini", "key-2", 0, now]);

		const active = db.query("SELECT * FROM providers WHERE cli = ? AND isActive = 1").get("gemini") as any;
		expect(active).not.toBeNull();
		expect(active.name).toBe("Active");

		const noActive = db.query("SELECT * FROM providers WHERE cli = ? AND isActive = 1").get("claude") as any;
		expect(noActive).toBeNull();
	});

	test("orders by createdAt DESC", () => {
		db.run("INSERT INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)", ["p1", "Old", "claude", "sk-1", 0, 1000]);
		db.run("INSERT INTO providers (id, name, cli, apiKey, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)", ["p2", "New", "claude", "sk-2", 0, 2000]);

		const rows = db.query("SELECT * FROM providers ORDER BY createdAt DESC").all() as any[];
		expect(rows[0].name).toBe("New");
		expect(rows[1].name).toBe("Old");
	});

	test("stores optional fields as null", () => {
		db.run(
			"INSERT INTO providers (id, name, cli, apiKey, baseUrl, model, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			["p1", "Minimal", "claude", "sk-1", null, null, 0, Date.now()]
		);

		const row = db.query("SELECT * FROM providers WHERE id = ?").get("p1") as any;
		expect(row.baseUrl).toBeNull();
		expect(row.model).toBeNull();
	});
});
