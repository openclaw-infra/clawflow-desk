import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";

const HOME = homedir();

// Claude Code config paths
const CLAUDE_SETTINGS = join(HOME, ".claude", "settings.json");
const CLAUDE_MCP = join(HOME, ".claude.json");
const CLAUDE_PROMPT = join(HOME, ".claude", "CLAUDE.md");

export function readClaudeConfig(): Record<string, any> {
	try {
		if (existsSync(CLAUDE_SETTINGS)) {
			return JSON.parse(readFileSync(CLAUDE_SETTINGS, "utf-8"));
		}
	} catch {}
	return ;
}

export function writeClaudeConfig(config: Record<string, any>): void {
	const dir = join(HOME, ".claude");
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	// Atomic write: write to tmp then rename
	const tmp = CLAUDE_SETTINGS + ".tmp";
	writeFileSync(tmp, JSON.stringify(config, null, 2));
	const { renameSync } = require("fs");
	renameSync(tmp, CLAUDE_SETTINGS);
}

export function setClaudeProvider(apiKey: string, baseUrl?: string, model?: string): void {
	const config = readClaudeConfig();
	if (!config.env) config.env = {};
	config.env.ANTHROPIC_API_KEY = apiKey;
	if (baseUrl) config.env.ANTHROPIC_BASE_URL = baseUrl;
	if (model) config.env.CLAUDE_MODEL = model;
	writeClaudeConfig(config);
}

export function getClaudeActiveKey(): string | undefined {
	const config = readClaudeConfig();
	return config?.env?.ANTHROPIC_API_KEY || config?.env?.ANTHROPIC_AUTH_TOKEN;
}

export function isClaudeInstalled(): boolean {
	try {
		const { execSync } = require("child_process");
		execSync("which claude", { stdio: "ignore" });
		return true;
	} catch {
		return existsSync(join(HOME, ".claude"));
	}
}
