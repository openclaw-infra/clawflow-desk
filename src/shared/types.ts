import { RPCSchema } from "electrobun/bun";

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

export type ClawFlowRPC = {
	bun: RPCSchema<{
		requests: {
			getProviders: { params: ; response: Provider[] };
			getActiveProvider: { params: { cli: string }; response: Provider | null };
			setActiveProvider: { params: { cli: string; providerId: string }; response: void };
			saveProvider: { params: { provider: Provider }; response: Provider };
			deleteProvider: { params: { providerId: string }; response: void };
			getCLIStatus: { params: {}; response: CLIStatus };
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
		};
	}>;
};
