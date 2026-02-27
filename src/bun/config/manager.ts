import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from "fs";
import { Database } from "bun:sqlite";
import type { Provider, CLIStatus } from "./types";
import * as claude from "./claude";
import * as codex from "./codex";
import * as gemini from "./gemini";

const OPENDESK_DIR = join(homedir(), ".clawflow-desk");
const DB_PATH = join(OPENDESK_DIR, "clawflow-desk.db");

export class ConfigManager {
	private db: Database;

	constructor() {
		if (!existsSync(OPENDESK_DIR)) mkdirSync(OPENDESK_DIR, { recursive: true });
		this.db = new Database(DB_PATH);
		this.initDB();
	}

	private initDB(): void {
		this.db.run(`
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
	}

	getProviders(): Provider[] {
		const rows = this.db.query("SELECT * FROM providers ORDER BY createdAt DESC").all() as any[];
		return rows.map((r) => ({
			...r,
			isActive: Boolean(r.isActive),
		}));
	}

	getProviderById(providerId: string): Provider | null {
		const row = this.db.query("SELECT * FROM providers WHERE id = ?").get(providerId) as any;
		if (!row) return null;
		return { ...row, isActive: Boolean(row.isActive) };
	}

	getDBPath(): string {
		return DB_PATH;
	}

	getActiveProvider(cli: string): Provider | null {
		const row = this.db.query("SELECT * FROM providers WHERE cli = ? AND isActive = 1").get(cli) as any;
		if (!row) return null;
		return { ...row, isActive: Boolean(row.isActive) };
	}

	saveProvider(provider: Omit<Provider, "createdAt"> & { createdAt?: number }): Provider {
		const p: Provider = {
			...provider,
			createdAt: provider.createdAt || Date.now(),
		};

		this.db.run(
			`INSERT OR REPLACE INTO providers (id, name, cli, apiKey, baseUrl, model, isActive, createdAt)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[p.id, p.name, p.cli, p.apiKey, p.baseUrl || null, p.model || null, p.isActive ? 1 : 0, p.createdAt]
		);

		return p;
	}

	deleteProvider(providerId: string): void {
		this.db.run("DELETE FROM providers WHERE id = ?", [providerId]);
	}

	setActiveProvider(cli: string, providerId: string): void {
		// Deactivate all providers for this CLI
		this.db.run("UPDATE providers SET isActive = 0 WHERE cli = ?", [cli]);
		// Activate the selected one
		this.db.run("UPDATE providers SET isActive = 1 WHERE id = ?", [providerId]);

		// Write to actual CLI config files
		const provider = this.db.query("SELECT * FROM providers WHERE id = ?").get(providerId) as any;
		if (!provider) return;

		switch (cli) {
			case "claude":
				claude.setClaudeProvider(provider.apiKey, provider.baseUrl, provider.model);
				break;
			case "codex":
				codex.setCodexProvider(provider.apiKey, provider.baseUrl, provider.model);
				break;
			case "gemini":
				gemini.setGeminiProvider(provider.apiKey, provider.baseUrl, provider.model);
				break;
		}
	}

	getCLIStatus(): CLIStatus {
		const getActive = (cli: string) => {
			const p = this.getActiveProvider(cli);
			return p?.name;
		};

		return {
			claude: {
				installed: claude.isClaudeInstalled(),
				configPath: join(homedir(), ".claude", "settings.json"),
				activeProvider: getActive("claude"),
			},
			codex: {
				installed: codex.isCodexInstalled(),
				configPath: join(homedir(), ".codex", "auth.json"),
				activeProvider: getActive("codex"),
			},
			gemini: {
				installed: gemini.isGeminiInstalled(),
				configPath: join(homedir(), ".gemini", ".env"),
				activeProvider: getActive("gemini"),
			},
		};
	}
}
