import type { ClawFlowRPC } from "../../shared/types";

// Detect if running inside Electrobun WebView
const isElectrobun = (() => {
	try {
		const params = new URLSearchParams(window.location.search);
		return !!(params.get("webviewId") || (window as any).__electrobun);
	} catch {
		return false;
	}
})();

// Mock data for browser preview
const MOCK_AGENTS = [
	{ id: "agent-1", name: "Claude Dev", cli: "claude", providerId: "p1", color: "#d97757", icon: "🧠", workDir: "~/projects/myapp", sortOrder: 0 },
	{ id: "agent-2", name: "Codex Review", cli: "codex", providerId: "p2", color: "#10a37f", icon: "🔍", workDir: "~/projects/api", sortOrder: 1 },
	{ id: "agent-3", name: "Gemini Chat", cli: "gemini", providerId: "p3", color: "#4285f4", icon: "💬", workDir: "~/projects/web", sortOrder: 2 },
];

const MOCK_PROVIDERS = [
	{ id: "p1", name: "Anthropic Direct", cli: "claude", apiKey: "sk-ant-***", baseUrl: "https://api.anthropic.com", isActive: true },
	{ id: "p2", name: "OpenAI", cli: "codex", apiKey: "sk-***", baseUrl: "https://api.openai.com", isActive: true },
	{ id: "p3", name: "Google AI", cli: "gemini", apiKey: "AIza***", baseUrl: "https://generativelanguage.googleapis.com", isActive: true },
];

const MOCK_CLI_STATUS = {
	claude: { installed: true, configPath: "~/.claude/settings.json" },
	codex: { installed: true, configPath: "~/.codex/auth.json" },
	gemini: { installed: true, configPath: "~/.gemini/.env" },
};

const MOCK_MCP_CONFIG = {
	servers: [
		{ name: "filesystem", command: "npx", args: ["-y", "@anthropic/mcp-filesystem"], disabled: false },
		{ name: "github", command: "npx", args: ["-y", "@anthropic/mcp-github"], disabled: false },
		{ name: "postgres", command: "npx", args: ["-y", "@anthropic/mcp-postgres"], disabled: true },
	],
};

// Mock API — returns demo data for browser preview
const mockApi = {
	getAgents: async () => MOCK_AGENTS,
	saveAgent: async (_agent: any) => {},
	deleteAgent: async (_agentId: string) => {},
	reorderAgents: async (_agentIds: string[]) => {},
	getProviders: async () => MOCK_PROVIDERS,
	getActiveProvider: async (_cli: string) => MOCK_PROVIDERS[0],
	setActiveProvider: async (_cli: string, _providerId: string) => {},
	saveProvider: async (_provider: any) => {},
	deleteProvider: async (_providerId: string) => {},
	getCLIStatus: async () => MOCK_CLI_STATUS,
	getMCPConfig: async (_cli: string) => MOCK_MCP_CONFIG,
	saveMCPServer: async (_cli: string, _server: any) => {},
	deleteMCPServer: async (_cli: string, _name: string) => {},
	toggleMCPServer: async (_cli: string, _name: string, _disabled: boolean) => {},
	getPromptFile: async (_cli: string) => ({ path: "~/.claude/CLAUDE.md", content: "# CLAUDE.md\n\nYou are a helpful coding assistant.\n\n## Rules\n- Write clean, maintainable code\n- Follow project conventions\n- Add tests for new features" }),
	savePromptFile: async (_cli: string, _content: string) => {},
	startCLI: async (_cli: string, _args?: string[]) => ({ pid: 12345 }),
	stopCLI: async (_cli: string) => {},
	getCLIProcess: async (_cli: string) => null,
	listCLIProcesses: async () => [],
	exportConfig: async (_filePath?: string) => "/tmp/clawflow-backup.json",
	importConfig: async (_filePath: string) => {},
	terminalSpawn: async (_agentId: string) => ({ sessionId: "mock-session" }),
	terminalWrite: async (_sessionId: string, _data: string) => {},
	terminalResize: async (_sessionId: string, _cols: number, _rows: number) => {},
	terminalKill: async (_sessionId: string) => {},
	getSetting: async (_key: string) => null as string | null,
	setSetting: async (_key: string, _value: string) => {},
};

// Real Electrobun API — lazy init to avoid WebSocket error in browser
let realApi: typeof mockApi | null = null;

async function initRealApi() {
	if (realApi) return realApi;
	const { Electroview } = await import("electrobun/view");
	const rpc = Electroview.defineRPC<ClawFlowRPC>({
		handlers: {
			requests: {},
			messages: {
				refreshProviders: () => { window.dispatchEvent(new CustomEvent("clawflow:refresh-providers")); },
				refreshStatus: () => { window.dispatchEvent(new CustomEvent("clawflow:refresh-status")); },
				refreshMCP: () => { window.dispatchEvent(new CustomEvent("clawflow:refresh-mcp")); },
				refreshPrompts: () => { window.dispatchEvent(new CustomEvent("clawflow:refresh-prompts")); },
				refreshAgents: () => { window.dispatchEvent(new CustomEvent("clawflow:refresh-agents")); },
				terminalData: ({ sessionId, data }) => { window.dispatchEvent(new CustomEvent("clawflow:terminal-data", { detail: { sessionId, data } })); },
				terminalExit: ({ sessionId, code }) => { window.dispatchEvent(new CustomEvent("clawflow:terminal-exit", { detail: { sessionId, code } })); },
			},
		},
	});
	const electroview = new Electroview({ rpc });
	realApi = {
		getAgents: () => electroview.rpc.request.getAgents({}),
		saveAgent: (agent: any) => electroview.rpc.request.saveAgent({ agent }),
		deleteAgent: (agentId: string) => electroview.rpc.request.deleteAgent({ agentId }),
		reorderAgents: (agentIds: string[]) => electroview.rpc.request.reorderAgents({ agentIds }),
		getProviders: () => electroview.rpc.request.getProviders({}),
		getActiveProvider: (cli: string) => electroview.rpc.request.getActiveProvider({ cli }),
		setActiveProvider: (cli: string, providerId: string) => electroview.rpc.request.setActiveProvider({ cli, providerId }),
		saveProvider: (provider: any) => electroview.rpc.request.saveProvider({ provider }),
		deleteProvider: (providerId: string) => electroview.rpc.request.deleteProvider({ providerId }),
		getCLIStatus: () => electroview.rpc.request.getCLIStatus({}),
		getMCPConfig: (cli: string) => electroview.rpc.request.getMCPConfig({ cli }),
		saveMCPServer: (cli: string, server: any) => electroview.rpc.request.saveMCPServer({ cli, server }),
		deleteMCPServer: (cli: string, name: string) => electroview.rpc.request.deleteMCPServer({ cli, name }),
		toggleMCPServer: (cli: string, name: string, disabled: boolean) => electroview.rpc.request.toggleMCPServer({ cli, name, disabled }),
		getPromptFile: (cli: string) => electroview.rpc.request.getPromptFile({ cli }),
		savePromptFile: (cli: string, content: string) => electroview.rpc.request.savePromptFile({ cli, content }),
		startCLI: (cli: string, args?: string[]) => electroview.rpc.request.startCLI({ cli, args }),
		stopCLI: (cli: string) => electroview.rpc.request.stopCLI({ cli }),
		getCLIProcess: (cli: string) => electroview.rpc.request.getCLIProcess({ cli }),
		listCLIProcesses: () => electroview.rpc.request.listCLIProcesses({}),
		exportConfig: (filePath?: string) => electroview.rpc.request.exportConfig({ filePath }),
		importConfig: (filePath: string) => electroview.rpc.request.importConfig({ filePath }),
		terminalSpawn: (agentId: string) => electroview.rpc.request.terminalSpawn({ agentId }),
		terminalWrite: (sessionId: string, data: string) => electroview.rpc.request.terminalWrite({ sessionId, data }),
		terminalResize: (sessionId: string, cols: number, rows: number) => electroview.rpc.request.terminalResize({ sessionId, cols, rows }),
		terminalKill: (sessionId: string) => electroview.rpc.request.terminalKill({ sessionId }),
		getSetting: (key: string) => electroview.rpc.request.getSetting({ key }),
		setSetting: (key: string, value: string) => electroview.rpc.request.setSetting({ key, value }),
	};
	return realApi;
}

// Proxy API — routes to real or mock based on environment
function createProxyApi(): typeof mockApi {
	if (!isElectrobun) {
		console.log("[ClawFlow] Browser preview mode — using mock data");
		return mockApi;
	}
	// Wrap each method to lazy-init real API
	const handler: ProxyHandler<typeof mockApi> = {
		get(_target, prop: string) {
			return async (...args: any[]) => {
				const real = await initRealApi();
				return (real as any)[prop](...args);
			};
		},
	};
	return new Proxy(mockApi, handler);
}

export const api = createProxyApi();
