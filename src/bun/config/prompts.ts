import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from "fs";
import type { PromptFile } from "../../shared/types";

const HOME = homedir();

const PROMPT_PATHS: Record<string, { filename: string; path: string }> = {
	claude: { filename: "CLAUDE.md", path: join(HOME, ".claude", "CLAUDE.md") },
	codex: { filename: "AGENTS.md", path: join(HOME, ".codex", "AGENTS.md") },
	gemini: { filename: "GEMINI.md", path: join(HOME, ".gemini", "GEMINI.md") },
};

function atomicWrite(filePath: string, content: string): void {
	const dir = join(filePath, "..");
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	const tmp = filePath + ".tmp";
	writeFileSync(tmp, content);
	renameSync(tmp, filePath);
}

export function getPromptFile(cli: string): PromptFile {
	const c = cli as "claude" | "codex" | "gemini";
	const { filename, path } = PROMPT_PATHS[c];
	let content = "";
	let exists = false;
	try {
		if (existsSync(path)) {
			content = readFileSync(path, "utf-8");
			exists = true;
		}
	} catch {}
	return { cli: c, filename, path, content, exists };
}

export function savePromptFile(cli: string, content: string): void {
	const c = cli as "claude" | "codex" | "gemini";
	const { path } = PROMPT_PATHS[c];
	atomicWrite(path, content);
}
