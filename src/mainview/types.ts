export interface Provider {
	id: string;
	name: string;
	cli: "claude" | "codex" | "gemini";
	apiKey: string;
	baseUrl?: string;
	model?: string;
	isActive: boolean;
	createdAt: number;
}

export interface CLIStatus {
	claude: { installed: boolean; configPath: string; activeProvider?: string };
	codex: { installed: boolean; configPath: string; activeProvider?: string };
	gemini: { installed: boolean; configPath: string; activeProvider?: string };
}

export type CLIType = "claude" | "codex" | "gemini";
