import { proxy } from "valtio";
import { api } from "../lib/api";
import type { Provider, CLIType, CLIStatus } from "../types";

interface AppState {
	activeCLI: CLIType;
	view: "providers" | "add-provider" | "edit-provider";
	editingProvider: Provider | null;
	providers: Provider[];
	cliStatus: CLIStatus;
	loading: boolean;
}

export const store = proxy<AppState>({
	activeCLI: "claude",
	view: "providers",
	editingProvider: null,
	providers: [],
	cliStatus: {
		claude: { installed: false, configPath: "~/.claude/settings.json" },
		codex: { installed: false, configPath: "~/.codex/auth.json" },
		gemini: { installed: false, configPath: "~/.gemini/.env" },
	},
	loading: false,
});

export const actions = {
	selectCLI(cli: CLIType) {
		store.activeCLI = cli;
		store.view = "providers";
		store.editingProvider = null;
	},

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
		store.view = "providers";
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
			const saved = await api.saveProvider({
				...provider,
				createdAt: Date.now(),
			});
			// Reload from backend
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
