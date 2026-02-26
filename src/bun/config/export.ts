import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { getMCPConfig } from "./mcp";
import { getPromptFile } from "./prompts";
import type { Provider } from "../../shared/types";

const HOME = homedir();

export interface ExportData {
	version: 1;
	exportedAt: number;
	providers: Provider[];
	mcp: {
		claude: any[];
		codex: any[];
		gemini: any[];
	};
	prompts: {
		claude: string;
		codex: string;
		gemini: string;
	};
}

export function exportAll(providers: Provider[]): ExportData {
	return {
		version: 1,
		exportedAt: Date.now(),
		providers,
		mcp: {
			claude: getMCPConfig("claude").servers,
			codex: getMCPConfig("codex").servers,
			gemini: getMCPConfig("gemini").servers,
		},
		prompts: {
			claude: getPromptFile("claude").content,
			codex: getPromptFile("codex").content,
			gemini: getPromptFile("gemini").content,
		},
	};
}

export function exportToFile(providers: Provider[], filePath: string): void {
	const data = exportAll(providers);
	const dir = dirname(filePath);
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	const tmp = filePath + ".tmp";
	writeFileSync(tmp, JSON.stringify(data, null, 2));
	renameSync(tmp, filePath);
}

export function importFromFile(filePath: string): ExportData {
	if (!existsSync(filePath)) {
		throw new Error(`File not found: ${filePath}`);
	}
	const raw = readFileSync(filePath, "utf-8");
	const data = JSON.parse(raw) as ExportData;

	if (data.version !== 1) {
		throw new Error(`Unsupported export version: ${data.version}`);
	}

	return data;
}

export function getDefaultExportPath(): string {
	return join(HOME, ".clawflow-desk", "backup.json");
}
