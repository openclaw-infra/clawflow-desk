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
		},
	},
});

const electroview = new Electroview({ rpc });

export const api = {
	getProviders: () => electroview.rpc.request.getProviders({}),
	getActiveProvider: (cli: string) => electroview.rpc.request.getActiveProvider({ cli }),
	setActiveProvider: (cli: string, providerId: string) =>
		electroview.rpc.request.setActiveProvider({ cli, providerId }),
	saveProvider: (provider: any) => electroview.rpc.request.saveProvider({ provider }),
	deleteProvider: (providerId: string) => electroview.rpc.request.deleteProvider({ providerId }),
	getCLIStatus: () => electroview.rpc.request.getCLIStatus({}),
};
