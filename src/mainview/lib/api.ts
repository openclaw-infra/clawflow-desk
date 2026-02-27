import { Electroview } from "electrobun/view";
import type { ClawFlowRPC } from "../../shared/types";

const rpc = Electroview.defineRPC<ClawFlowRPC>({
	handlers: {
		requests: {},
		messages: {
			refreshProviders: () => {
				window.dispatchEvent(new CustomEvent("clawflow:refresh-providers"));
			},
			refreshStatus: () => {
				window.dispatchEvent(new CustomEvent("clawflow:refresh-status"));
			},
			refreshMCP: () => {
				window.dispatchEvent(new CustomEvent("clawflow:refresh-mcp"));
			},
			refreshPrompts: () => {
				window.dispatchEvent(new CustomEvent("clawflow:refresh-prompts"));
			},
			refreshAgents: () => {
				window.dispatchEvent(new CustomEvent("clawflow:refresh-agents"));
			},
			terminalData: ({ sessionId, data }) => {
				window.dispatchEvent(new CustomEvent("clawflow:terminal-data", { detail: { sessionId, data } }));
			},
			terminalExit: ({ sessionId, code }) => {
				window.dispatchEvent(new CustomEvent("clawflow:terminal-exit", { detail: { sessionId, code } }));
			},
		},
	},
});

const electroview = new Electroview({ rpc });

export const api = {
	// Agent instances
	getAgents: () => electroview.rpc.request.getAgents({}),
	saveAgent: (agent: any) => electroview.rpc.request.saveAgent({ agent }),
	deleteAgent: (agentId: string) => electroview.rpc.request.deleteAgent({ agentId }),
	reorderAgents: (agentIds: string[]) => electroview.rpc.request.reorderAgents({ agentIds }),
	// Provider
	getProviders: () => electroview.rpc.request.getProviders({}),
	getActiveProvider: (cli: string) => electroview.rpc.request.getActiveProvider({ cli }),
	setActiveProvider: (cli: string, providerId: string) =>
		electroview.rpc.request.setActiveProvider({ cli, providerId }),
	saveProvider: (provider: any) => electroview.rpc.request.saveProvider({ provider }),
	deleteProvider: (providerId: string) => electroview.rpc.request.deleteProvider({ providerId }),
	getCLIStatus: () => electroview.rpc.request.getCLIStatus({}),
	// MCP
	getMCPConfig: (cli: string) => electroview.rpc.request.getMCPConfig({ cli }),
	saveMCPServer: (cli: string, server: any) => electroview.rpc.request.saveMCPServer({ cli, server }),
	deleteMCPServer: (cli: string, name: string) => electroview.rpc.request.deleteMCPServer({ cli, name }),
	toggleMCPServer: (cli: string, name: string, disabled: boolean) =>
		electroview.rpc.request.toggleMCPServer({ cli, name, disabled }),
	// Prompts
	getPromptFile: (cli: string) => electroview.rpc.request.getPromptFile({ cli }),
	savePromptFile: (cli: string, content: string) => electroview.rpc.request.savePromptFile({ cli, content }),
	// Process
	startCLI: (cli: string, args?: string[]) => electroview.rpc.request.startCLI({ cli, args }),
	stopCLI: (cli: string) => electroview.rpc.request.stopCLI({ cli }),
	getCLIProcess: (cli: string) => electroview.rpc.request.getCLIProcess({ cli }),
	listCLIProcesses: () => electroview.rpc.request.listCLIProcesses({}),
	// Export/Import
	exportConfig: (filePath?: string) => electroview.rpc.request.exportConfig({ filePath }),
	importConfig: (filePath: string) => electroview.rpc.request.importConfig({ filePath }),
	// Terminal
	terminalSpawn: (agentId: string) => electroview.rpc.request.terminalSpawn({ agentId }),
	terminalWrite: (sessionId: string, data: string) => electroview.rpc.request.terminalWrite({ sessionId, data }),
	terminalResize: (sessionId: string, cols: number, rows: number) => electroview.rpc.request.terminalResize({ sessionId, cols, rows }),
	terminalKill: (sessionId: string) => electroview.rpc.request.terminalKill({ sessionId }),
};
