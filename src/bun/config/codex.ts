import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from "fs";

const HOME = homedir();
const CODEX_AUTH = join(HOME, ".codex", "auth.json");
const CODEX_CONFIG = join(HOME, ".codex", "config.toml");
const CODEX_PROMPT = join(HOME, ".codex", "AGENTS.md");

export function readCodexAuth(): Record<string, any> {
	try {
		if (existsSync(CODEX_AUTH)) {
			return JSON.parse(readFileSync(CODEX_AUTH, "utf-8"));
		}
	} catch {}
	return {};
}

export function writeCodexAuth(config: Record<string, any>): void {
	const dir = join(HOME, ".codex");
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	const tmp = CODEX_AUTH + ".tmp";
	writeFileSync(tmp, JSON.stringify(config, null, 2));
	renameSync(tmp, CODEX_AUTH);
}

export function setCodexProvider(apiKey: string, baseUrl?: string, model?: string): void {
	const auth = readCodexAuth();
	auth.OPENAI_API_KEY = apiKey;
	if (baseUrl) auth.OPENAI_BASE_URL = baseUrl;
	writeCodexAuth(auth);

	// Write model to config.toml if specified
	if (model && existsSync(CODEX_CONFIG)) {
		try {
			let toml = readFileSync(CODEX_CONFIG, "utf-8");
			// Simple model replacement in TOML
			if (toml.includes("model =")) {
				toml = toml.replace(/model\s*=\s*"[^"]*"/, `model = "${model}"`);
			}
			writeFileSync(CODEX_CONFIG, toml);
		} catch {}
	}
}

export function getCodexActiveKey(): string | undefined {
	const auth = readCodexAuth();
	return auth?.OPENAI_API_KEY;
}

export function isCodexInstalled(): boolean {
	try {
		const { execSync } = require("child_process");
		execSync("which codex", { stdio: "ignore" });
		return true;
	} catch {
		return existsSync(join(HOME, ".codex"));
	}
}
