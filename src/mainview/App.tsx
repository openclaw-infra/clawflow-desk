import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { store, actions } from "./store";
import { initTheme } from "./store/theme";
import { Sidebar } from "./components/Sidebar";
import { TerminalView } from "./components/TerminalView";
import { ProviderList } from "./components/ProviderList";
import { ProviderForm } from "./components/ProviderForm";
import { MCPList } from "./components/MCPList";
import { MCPForm } from "./components/MCPForm";
import { PromptsEditor } from "./components/PromptsEditor";
import { ProcessManager } from "./components/ProcessManager";
import { Settings } from "./components/Settings";
import { StatusBar } from "./components/StatusBar";
import { Pin, Search, Inbox } from "lucide-react";

function App() {
	const snap = useSnapshot(store);

	useEffect(() => {
		initTheme();
		actions.init();
	}, []);

	const activeAgent = snap.agents.find(a => a.id === snap.activeAgentId);

	const renderContent = () => {
		switch (snap.view) {
			case "terminal": {
				if (!activeAgent) return (
					<div className="flex-1 flex items-center justify-center text-[#949ba4]">
						No agent selected. Click + to add one.
					</div>
				);
				return <TerminalView key={activeAgent.id} agent={activeAgent as any} active={true} />;
			}
			case "providers": return <ProviderList />;
			case "add-provider":
			case "edit-provider": return <ProviderForm />;
			case "mcp": return <MCPList />;
			case "add-mcp":
			case "edit-mcp": return <MCPForm />;
			case "prompts": return <PromptsEditor />;
			case "processes": return <ProcessManager />;
			case "settings": return <Settings />;
			default: return null;
		}
	};

	const isTerminal = snap.view === "terminal";

	// Page titles for non-terminal views
	const viewTitles: Record<string, string> = {
		providers: "Providers",
		"add-provider": "Add Provider",
		"edit-provider": "Edit Provider",
		mcp: "MCP Servers",
		"add-mcp": "Add MCP Server",
		"edit-mcp": "Edit MCP Server",
		prompts: "Prompts",
		processes: "Processes",
		settings: "Settings",
	};

	return (
		<div className="flex h-screen overflow-hidden bg-[#313338] relative">
			{/* macOS Titlebar */}
			<div className="absolute top-0 left-0 right-0 h-8 flex items-center px-3 gap-2 z-10 bg-[#1e1f22]" style={{ WebkitAppRegion: "drag" } as any}>
				<div className="flex gap-2 px-1">
					<div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
					<div className="w-3 h-3 rounded-full bg-[#febc2e]" />
					<div className="w-3 h-3 rounded-full bg-[#28c840]" />
				</div>
			</div>

			{/* Main layout below titlebar */}
			<div className="flex w-full pt-8">
				<Sidebar />
				<main className="flex-1 flex flex-col overflow-hidden bg-[#313338]">
					{/* Chat Toolbar */}
					<div className="h-12 px-4 flex items-center gap-2 border-b border-[#1f2023] shadow-[0_1px_0_rgba(0,0,0,.2)]">
						{isTerminal && activeAgent ? (
							<>
								<span className="text-2xl text-[#80848e] font-medium">#</span>
								<span className="text-base font-semibold text-[#f2f3f5]">
									{activeAgent.name.toLowerCase().replace(/\s+/g, '-')}
								</span>
								<div className="w-px h-6 bg-[#3f4147] mx-2" />
								<span className="text-sm text-[#949ba4] flex-1 truncate">
									{activeAgent.workDir && `Working on ${activeAgent.workDir}`}
									{activeAgent.workDir && " · "}
									{snap.providers.find(p => p.id === activeAgent.providerId)?.name || ""}
								</span>
								<div className="flex gap-1">
									<button className="w-7 h-7 rounded flex items-center justify-center text-[#b5bac1] hover:text-[#dbdee1]">
										<Pin className="w-4 h-4" />
									</button>
									<button className="w-7 h-7 rounded flex items-center justify-center text-[#b5bac1] hover:text-[#dbdee1]">
										<Search className="w-4 h-4" />
									</button>
									<button className="w-7 h-7 rounded flex items-center justify-center text-[#b5bac1] hover:text-[#dbdee1]">
										<Inbox className="w-4 h-4" />
									</button>
								</div>
							</>
						) : (
							<>
								<span className="text-base font-semibold text-[#f2f3f5]">
									{viewTitles[snap.view] || "ClawFlow"}
								</span>
							</>
						)}
					</div>

					{/* Content */}
					{isTerminal ? (
						renderContent()
					) : (
						<>
							<div className="flex-1 overflow-y-auto p-5">
								{renderContent()}
							</div>
							<StatusBar />
						</>
					)}
				</main>
			</div>
		</div>
	);
}

export default App;
