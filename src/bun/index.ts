import { BrowserWindow, BrowserView, Tray, Updater, Utils } from "electrobun/bun";
import Electrobun from "electrobun/bun";
import type { ClawFlowRPC } from "../shared/types";
import { ConfigManager } from "./config/manager";
import { getMCPConfig, saveMCPServer, deleteMCPServer, toggleMCPServer } from "./config/mcp";
import { getPromptFile, savePromptFile } from "./config/prompts";
import { startCLI, stopCLI, getCLIProcess, listCLIProcesses, stopAll } from "./config/process";
import { exportToFile, importFromFile, getDefaultExportPath } from "./config/export";
import { startWatching, stopWatching } from "./config/watcher";
import { terminalSpawn, terminalWrite, terminalResize, terminalKill, killAllTerminals, setTerminalCallbacks } from "./config/terminal";

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
			// MCP management
			getMCPConfig: ({ cli }) => getMCPConfig(cli),
			saveMCPServer: ({ cli, server }) => saveMCPServer(cli, server),
			deleteMCPServer: ({ cli, name }) => deleteMCPServer(cli, name),
			toggleMCPServer: ({ cli, name, disabled }) => toggleMCPServer(cli, name, disabled),
			// Prompts management
			getPromptFile: ({ cli }) => getPromptFile(cli),
			savePromptFile: ({ cli, content }) => savePromptFile(cli, content),
			// Process management
			startCLI: ({ cli, args }) => startCLI(cli as any, args),
			stopCLI: ({ cli }) => stopCLI(cli as any),
			getCLIProcess: ({ cli }) => getCLIProcess(cli as any),
			listCLIProcesses: () => listCLIProcesses(),
			// Import/Export
			exportConfig: ({ filePath }) => {
				const path = filePath || getDefaultExportPath();
				exportToFile(configManager.getProviders(), path);
				return path;
			},
			importConfig: ({ filePath }) => importFromFile(filePath),
			// Terminal
			terminalSpawn: ({ cli }) => terminalSpawn(cli),
			terminalWrite: ({ sessionId, data }) => terminalWrite(sessionId, data),
			terminalResize: ({ sessionId, cols, rows }) => terminalResize(sessionId, cols, rows),
			terminalKill: ({ sessionId }) => terminalKill(sessionId),
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

// Wire terminal output to webview
setTerminalCallbacks(
	(sessionId, data) => {
		try { mainWindow.webview.rpc.send.terminalData({ sessionId, data }); } catch {}
	},
	(sessionId, code) => {
		try { mainWindow.webview.rpc.send.terminalExit({ sessionId, code }); } catch {}
	},
);

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

// Watch config files for external changes
startWatching((_path, _cli, type) => {
	try {
		if (type === "provider") {
			mainWindow.webview.rpc.send.refreshProviders({});
			mainWindow.webview.rpc.send.refreshStatus({});
			updateTrayMenu();
		} else if (type === "mcp") {
			mainWindow.webview.rpc.send.refreshMCP({});
		} else if (type === "prompt") {
			mainWindow.webview.rpc.send.refreshPrompts({});
		}
	} catch 
});

// Graceful shutdown
Electrobun.events.on("before-quit", async () => {
	stopAll();
	stopWatching();
	killAllTerminals();
});

console.log("ClawFlow Desk started!");
