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

function App() {
	const snap = useSnapshot(store);

	useEffect(() => {
		initTheme();
		actions.init();
	}, []);

	const renderContent = () => {
		switch (snap.view) {
			case "terminal":
				return <TerminalView cli={snap.activeCLI} active={true} />;
			case "providers":
				return <ProviderList />;
			case "add-provider":
			case "edit-provider":
				return <ProviderForm />;
			case "mcp":
				return <MCPList />;
			case "add-mcp":
			case "edit-mcp":
				return <MCPForm />;
			case "prompts":
				return <PromptsEditor />;
			case "processes":
				return <ProcessManager />;
			case "settings":
				return <Settings />;
			default:
				return <TerminalView cli={snap.activeCLI} active={true} />;
		}
	};

	const isTerminal = snap.view === "terminal";

	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<main className="flex-1 flex flex-col overflow-hidden">
				{isTerminal ? (
					renderContent()
				) : (
					<>
						<div className="flex-1 overflow-y-auto p-6">
							{renderContent()}
						</div>
						<StatusBar />
					</>
				)}
			</main>
		</div>
	);
}

export default App;
