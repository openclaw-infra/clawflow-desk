import { BrowserWindow, BrowserView, Tray, Updater, Utils } from "electrobun/bun";
import Electrobun from "electrobun/bun";
import type { ClawFlowRPC } from "../shared/types";
import { ConfigManager } from "./config/manager";

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

const configManager = new ConfigManager();

// Define typed RPC
const rpc = BrowserView.defineRPC<ClawFlowRPC>({
	handlers: {
		requests: {
			getProviders: () => configManager.getProviders(),
			getActiveProvider: ({ cli }) => configManager.getActiveProvider(cli),
			setActiveProvider: ({ cli, providerId }) => {
				configManager.setActiveProvider(cli, providerId);
				updateTrayMenu();
			},
			saveProvider: ({ provider }) => configManager.saveProvider(provider),
			deleteProvider: ({ providerId }) => configManager.deleteProvider(providerId),
			getCLIStatus: () => configManager.getCLIStatus(),
		},
		messages: {},
	},
});

// Check for dev server
async function getMainViewUrl(): Promise<string> {
	const channel = await Updater.localInfo.channel();
	if (channel === "dev") {
		try {
			await fetch(DEV_SERVER_URL, { method: "HEAD" });
			console.log(`HMR enabled: ${DEV_SERVER_URL}`);
			return DEV_SERVER_URL;
		} catch {
			console.log("Vite dev server not running. Run 'bun run dev:hmr' for HMR.");
		}
	}
	return "views://mainview/index.html";
}

const url = await getMainViewUrl();

// Create main window
const mainWindow = new BrowserWindow({
	title: "ClawFlow Desk",
	url,
	rpc,
	frame: { width: 960, height: 680, x: 200, y: 200 },
});

// System tray
const tray = new Tray({
	title: "ClawFlow",
	template: true,
	width: 22,
	height: 22,
});

function updateTrayMenu() {
	const providers = configManager.getProviders();
	const clis = ["claude", "codex", "gemini"] as const;

	const menuItems: any[] = [
		{ type: "normal", label: "Open ClawFlow Desk", action: "open" },
		{ type: "divider" },
	];

	for (const cli of clis) {
		const cliProviders = providers.filter((p) => p.cli === cli);
		if (cliProviders.length === 0) continue;

		const label = cli === "claude" ? "Claude Code" : cli === "codex" ? "Codex" : "Gemini";
		menuItems.push({
			type: "normal",
			label,
			submenu: cliProviders.map((p) => ({
				type: "normal",
				label: `${p.isActive ? "✓ " : "  "}${p.name}`,
				action: `switch:${cli}:${p.id}`,
			})),
		});
	}

	menuItems.push(
		{ type: "divider" },
		{ type: "normal", label: "Quit", action: "quit" },
	);

	tray.setMenu(menuItems);
}

tray.on("tray-clicked", () => {
	mainWindow.focus();
});

tray.on("tray-item-clicked", (e) => {
	const action = e.data.action;
	if (action === "open") {
		mainWindow.focus();
	} else if (action === "quit") {
		Utils.quit();
	} else if (action.startsWith("switch:")) {
		const [, cli, providerId] = action.split(":");
		configManager.setActiveProvider(cli, providerId);
		updateTrayMenu();
		// Notify webview to refresh
		mainWindow.webview.rpc.send.refreshProviders({});
	}
});

// Initialize tray menu
updateTrayMenu();

// Graceful shutdown
Electrobun.events.on("before-quit", async () => {
	// ConfigManager uses SQLite, auto-closes
});

console.log("ClawFlow Desk started!");
