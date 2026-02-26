import { proxy } from "valtio";
import type { Provider, CLIType, CLIStatus } from "../types";

interface AppState {
	// UI state
	activeCLI: CLIType;
	view: "providers" | "add-provider" | "edit-provider";
	editingProvider: Provider | null;

	// Data
	providers: Provider[];
	cliStatus: CLIStatus;
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
});

// Actions
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
		// TODO: IPC call
		// const data = await rpc.invoke("config:getProviders");
		// store.providers = data;
	},

	async saveProvider(provider: Omit<Provider, "createdAt">) {
		const p: Provider = { ...provider, createdAt: Date.now() };
		// TODO: IPC call
		const idx = store.providers.findIndex((x) => x.id === p.id);
		if (idx >= 0) {
			store.providers[idx] = p;
		} else {
			store.providers.unshift(p);
		}
		store.view = "providers";
		store.editingProvider = null;
	},

	async deleteProvider(id: string) {
		// TODO: IPC call
		store.providers = store.providers.filter((p) => p.id !== id);
	},

	async activateProvider(cli: CLIType, id: string) {
		// TODO: IPC call
		store.providers = store.providers.map((p) =>
			p.cli === cli ? { ...p, isActive: p.id === id } : p
		);
	},

	async loadCLIStatus() {
		// TODO: IPC call
		// const data = await rpc.invoke("config:getCLIStatus");
		// store.cliStatus = data;
	},
};
