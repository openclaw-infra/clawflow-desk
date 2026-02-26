import { RPCSchema } from "electrobun/bun";

// === Provider Types ===
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

// === MCP Types ===
export interface MCPServer {
	name: string;
	command: string;
	args?: string[];
	env?: Record<string, string>;
	disabled?: boolean;
}

export interface MCPConfig {
	cli: "claude" | "codex" | "gemini";
	servers: MCPServer[];
	configPath: string;
}

// === Prompts Types ===
export interface PromptFile {
	cli: "claude" | "codex" | "gemini";
	filename: string;
	path: string;
	content: string;
	exists: boolean;
}

// === Process Types ===
export interface CLIProcess {
	cli: "claude" | "codex" | "gemini";
	pid: number;
	status: "running" | "stopped" | "error";
	startedAt: number;
	command: string;
}

// === Export Types ===
export interface ExportData {
	version: 1;
	exportedAt: number;
	providers: Provider[];
	mcp: { claude: MCPServer[]; codex: MCPServer[]; gemini: MCPServer[] };
	prompts: { claude: string; codex: string; gemini: string };
}

// === RPC Schema ===
export type ClawFlowRPC = {
	bun: RPCSchema<{
		requests: {
			// Provider management
			getProviders: { params: {}; response: Provider[] };
			getActiveProvider: { params: { cli: string }; response: Provider | null };
			setActiveProvider: { params: { cli: string; providerId: string }; response: void };
			saveProvider: { params: { provider: Provider }; response: Provider };
			deleteProvider: { params: { providerId: string }; response: void };
			getCLIStatus: { params: {}; response: CLIStatus };
			// MCP management
			getMCPConfig: { params: { cli: string }; response: MCPConfig };
			saveMCPServer: { params: { cli: string; server: MCPServer }; response: void };
			deleteMCPServer: { params: { cli: string; name: string }; response: void };
			toggleMCPServer: { params: { cli: string; name: string; disabled: boolean }; response: void };
			// Prompts management
			getPromptFile: { params: { cli: string }; response: PromptFile };
			savePromptFile: { params: { cli: string; content: string }; response: void };
			// Process management
			startCLI: { params: { cli: string; args?: string[] }; response: CLIProcess };
			stopCLI: { params: { cli: string }; response: boolean };
			getCLIProcess: { params: { cli: string }; response: CLIProcess | null };
			listCLIProcesses: { params: {}; response: CLIProcess[] };
			// Import/Export
			exportConfig: { params: { filePath?: string }; response: string };
			importConfig: { params: { filePath: string }; response: ExportData };
			// Terminal
			terminalSpawn: { params: { cli: string }; response: { sessionId: string } };
			terminalWrite: { params: { sessionId: string; data: string }; response: void };
			terminalResize: { params: { sessionId: string; cols: number; rows: number }; response: void };
			terminalKill: { params: { sessionId: string }; response: void };
		};
		messages: {
			providerChanged: { cli: string; providerId: string };
		};
	}>;
	webview: RPCSchema<{
		requests: {};
		messages: {
			refreshProviders: {};
			refreshStatus: {};
			refreshMCP: {};
			refreshPrompts: {};
			terminalData: { sessionId: string; data: string };
			terminalExit: { sessionId: string; code: number };
		};
		};
	}>;
};
