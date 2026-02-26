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
		},
	},
});

const electroview = new Electroview({ rpc });

export const api = {
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
};
