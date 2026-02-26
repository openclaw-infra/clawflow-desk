import { watch, type FSWatcher } from "fs";
import { homedir } from "os";
import { join } from "path";

const HOME = homedir();

// Config files to watch
const WATCH_PATHS = [
	join(HOME, ".claude", "settings.json"),
	join(HOME, ".claude.json"),
	join(HOME, ".claude", "CLAUDE.md"),
	join(HOME, ".codex", "auth.json"),
	join(HOME, ".codex", "config.toml"),
	join(HOME, ".codex", "AGENTS.md"),
	join(HOME, ".gemini", ".env"),
	join(HOME, ".gemini", "settings.json"),
	join(HOME, ".gemini", "GEMINI.md"),
];

type ChangeCallback = (path: string, cli: string, type: "provider" | "mcp" | "prompt") => void;

function classifyPath(path: string): { cli: string; type: "provider" | "mcp" | "prompt" } {
	if (path.includes(".claude")) {
		if (path.endsWith("CLAUDE.md")) return { cli: "claude", type: "prompt" };
		if (path.endsWith(".claude.json")) return { cli: "claude", type: "mcp" };
		return { cli: "claude", type: "provider" };
	}
	if (path.includes(".codex")) {
		if (path.endsWith("AGENTS.md")) return { cli: "codex", type: "prompt" };
		if (path.endsWith("config.toml")) return { cli: "codex", type: "mcp" };
		return { cli: "codex", type: "provider" };
	}
	if (path.includes(".gemini")) {
		if (path.endsWith("GEMINI.md")) return { cli: "gemini", type: "prompt" };
		if (path.endsWith("settings.json")) return { cli: "gemini", type: "mcp" };
		return { cli: "gemini", type: "provider" };
	}
	return { cli: "unknown", type: "provider" };
}

const watchers: FSWatcher[] = [];
let debounceTimers = new Map<string, Timer>();

export function startWatching(onChange: ChangeCallback): void {
	for (const filePath of WATCH_PATHS) {
		try {
			const watcher = watch(filePath, (event) => {
				if (event !== "change") return;

				// Debounce: ignore rapid changes (atomic writes trigger multiple events)
				const existing = debounceTimers.get(filePath);
				if (existing) clearTimeout(existing);

				debounceTimers.set(
					filePath,
					setTimeout(() => {
						debounceTimers.delete(filePath);
						const { cli, type } = classifyPath(filePath);
						onChange(filePath, cli, type);
					}, 300)
				);
			});
			watchers.push(watcher);
		} catch {
			// File doesn't exist yet, skip
		}
	}
}

export function stopWatching(): void {
	for (const w of watchers) {
		w.close();
	}
	watchers.length = 0;
	for (const timer of debounceTimers.values()) {
		clearTimeout(timer);
	}
	debounceTimers.clear();
}
