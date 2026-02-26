import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from "fs";

const HOME = homedir();
const GEMINI_ENV = join(HOME, ".gemini", ".env");
const GEMINI_SETTINGS = join(HOME, ".gemini", "settings.json");
const GEMINI_PROMPT = join(HOME, ".gemini", "GEMINI.md");

export function readGeminiEnv(): Record<string, string> {
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
					// Strip quotes
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

export function writeGeminiEnv(env: Record<string, string>): void {
	const dir = join(HOME, ".gemini");
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	const lines = Object.entries(env).map(([k, v]) => `${k}="${v}"`);
	const tmp = GEMINI_ENV + ".tmp";
	writeFileSync(tmp, lines.join("\n") + "\n");
	renameSync(tmp, GEMINI_ENV);
}

export function setGeminiProvider(apiKey: string, baseUrl?: string, model?: string): void {
	const env = readGeminiEnv();
	env.GEMINI_API_KEY = apiKey;
	if (baseUrl) env.GOOGLE_GEMINI_BASE_URL = baseUrl;
	if (model) env.GEMINI_MODEL = model;
	writeGeminiEnv(env);
}

export function getGeminiActiveKey(): string | undefined {
	const env = readGeminiEnv();
	return env.GEMINI_API_KEY || env.GOOGLE_GEMINI_API_KEY;
}

export function isGeminiInstalled(): boolean {
	try {
		const { execSync } = require("child_process");
		execSync("which gemini", { stdio: "ignore" });
		return true;
	} catch {
		return existsSync(join(HOME, ".gemini"));
	}
}
