import { BrowserWindow, Tray, ApplicationMenu, Updater } from "electrobun/bun";
import { ConfigManager } from "./config/manager";

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

// Initialize config manager
const configManager = new ConfigManager();

async function getMainViewUrl(): Promise<string> {
	const channel = await Updater.localInfo.channel();
	if (channel === "dev") {
		try {
			await fetch(DEV_SERVER_URL, { method: "HEAD" });
			console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
			return DEV_SERVER_URL;
		} catch {
			console.log("Vite dev server not running. Run 'bun run dev:hmr' for HMR support.");
		}
	}
	return "views://mainview/index.html";
}

const url = await getMainViewUrl();

// Create main window
const mainWindow = new BrowserWindow({
	title: "OpenDesk",
	url,
	frame: {
		width: 960,
		height: 680,
		x: 200,
		y: 200,
	},
});

// Register IPC handlers for frontend communication
mainWindow.rpc.handle("config:getProviders", async () => {
	return configManager.getProviders();
});

mainWindow.rpc.handle("config:getActiveProvider", async (cli: string) => {
	return configManager.getActiveProvider(cli);
});

mainWindow.rpc.handle("config:setActiveProvider", async (cli: string, providerId: string) => {
	return configManager.setActiveProvider(cli, providerId);
});

mainWindow.rpc.handle("config:saveProvider", async (provider: any) => {
	return configManager.saveProvider(provider);
});

mainWindow.rpc.handle("config:deleteProvider", async (providerId: string) => {
	return configManager.deleteProvider(providerId);
});

mainWindow.rpc.handle("config:getCLIStatus", async () => {
	return configManager.getCLIStatus();
});

console.log("OpenDesk started!");
