import { proxy } from "valtio";
import { api } from "../lib/api";
import type { Provider, CLIType, CLIStatus, MCPServer, MCPConfig, PromptFile } from "../types";

interface AppState {
	activeCLI: CLIType;
	view: "providers" | "add-provider" | "edit-provider" | "mcp" | "add-mcp" | "edit-mcp" | "prompts" | "processes" | "settings";
	editingProvider: Provider | null;
	editingMCP: MCPServer | null;
	providers: Provider[];
	mcpConfig: MCPConfig | null;
	promptFile: PromptFile | null;
	cliStatus: CLIStatus;
	loading: boolean;
}

export const store = proxy<AppState>({
	activeCLI: "claude",
	view: "providers",
	editingProvider: null,
	editingMCP: null,
	providers: [],
	mcpConfig: null,
	promptFile: null,
	cliStatus: {
		claude: { installed: false, configPath: "~/.claude/settings.json" },
		codex: { installed: false, configPath: "~/.codex/auth.json" },
		gemini: { installed: false, configPath: "~/.gemini/.env" },
	},
	loading: false,
});

export const actions = {
	// Navigation
	selectCLI(cli: CLIType) {
		store.activeCLI = cli;
		store.view = "providers";
		store.editingProvider = null;
		store.editingMCP = null;
	},

	showView(view: AppState["view"]) {
		store.view = view;
		store.editingProvider = null;
		store.editingMCP = null;
	},

	// Provider actions
	showAddProvider() {
		store.editingProvider = null;
		store.view = "add-provider";
	},

	showEditProvider(provider: Provider) {
		store.editingProvider = provider;
		store.view = "edit-provider";
	},

	backToList() {
		store.editingProvider = null;
		store.editingMCP = null;
		if (store.view === "add-mcp" || store.view === "edit-mcp") {
			store.view = "mcp";
		} else {
			store.view = "providers";
		}
	},

	async loadProviders() {
		try {
			store.loading = true;
			store.providers = await api.getProviders();
		} catch (e) {
			console.error("Failed to load providers:", e);
		} finally {
			store.loading = false;
		}
	},

	async saveProvider(provider: Omit<Provider, "createdAt">) {
		try {
			await api.saveProvider({ ...provider, createdAt: Date.now() });
			await actions.loadProviders();
			store.view = "providers";
			store.editingProvider = null;
		} catch (e) {
			console.error("Failed to save provider:", e);
		}
	},

	async deleteProvider(id: string) {
		try {
			await api.deleteProvider(id);
			await actions.loadProviders();
		} catch (e) {
			console.error("Failed to delete provider:", e);
		}
	},

	async activateProvider(cli: CLIType, id: string) {
		try {
			await api.setActiveProvider(cli, id);
			await actions.loadProviders();
		} catch (e) {
			console.error("Failed to activate provider:", e);
		}
	},

	// MCP actions
	showAddMCP() {
		store.editingMCP = null;
		store.view = "add-mcp";
	},

	showEditMCP(server: MCPServer) {
		store.editingMCP = server;
		store.view = "edit-mcp";
	},

	async loadMCPConfig() {
		try {
			store.mcpConfig = await api.getMCPConfig(store.activeCLI);
		} catch (e) {
			console.error("Failed to load MCP config:", e);
		}
	},

	async saveMCPServer(server: MCPServer) {
		try {
			await api.saveMCPServer(store.activeCLI, server);
			await actions.loadMCPConfig();
			store.view = "mcp";
			store.editingMCP = null;
		} catch (e) {
			console.error("Failed to save MCP server:", e);
		}
	},

	async deleteMCPServer(name: string) {
		try {
			await api.deleteMCPServer(store.activeCLI, name);
			await actions.loadMCPConfig();
		} catch (e) {
			console.error("Failed to delete MCP server:", e);
		}
	},

	async toggleMCPServer(name: string, disabled: boolean) {
		try {
			await api.toggleMCPServer(store.activeCLI, name, disabled);
			await actions.loadMCPConfig();
		} catch (e) {
			console.error("Failed to toggle MCP server:", e);
		}
	},

	// Prompts actions
	async loadPromptFile() {
		try {
			store.promptFile = await api.getPromptFile(store.activeCLI);
		} catch (e) {
			console.error("Failed to load prompt file:", e);
		}
	},

	async savePromptFile(content: string) {
		try {
			await api.savePromptFile(store.activeCLI, content);
			await actions.loadPromptFile();
		} catch (e) {
			console.error("Failed to save prompt file:", e);
		}
	},

	// CLI status
	async loadCLIStatus() {
		try {
			store.cliStatus = await api.getCLIStatus();
		} catch (e) {
			console.error("Failed to load CLI status:", e);
		}
	},

	async init() {
		await Promise.all([actions.loadProviders(), actions.loadCLIStatus()]);
	},
};

// Listen for refresh events from tray actions
if (typeof window !== "undefined") {
	window.addEventListener("clawflow:refresh-providers", () => {
		actions.loadProviders();
	});
	window.addEventListener("clawflow:refresh-status", () => {
		actions.loadCLIStatus();
	});
}
