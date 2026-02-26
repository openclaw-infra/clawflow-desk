import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ProviderList } from "./components/ProviderList";
import { ProviderForm } from "./components/ProviderForm";
import { StatusBar } from "./components/StatusBar";
import type { Provider } from "./types";

type View = "providers" | "add-provider" | "edit-provider";

function App() {
	const [view, setView] = useState<View>("providers");
	const [activeCLI, setActiveCLI] = useState<"claude" | "codex" | "gemini">("claude");
	const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

	const handleEdit = (provider: Provider) => {
		setEditingProvider(provider);
		setView("edit-provider");
	};

	const handleAdd = () => {
		setEditingProvider(null);
		setView("add-provider");
	};

	const handleBack = () => {
		setEditingProvider(null);
		setView("providers");
	};

	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar activeCLI={activeCLI} onSelectCLI={setActiveCLI} onAdd={handleAdd} />
			<main className="flex-1 flex flex-col overflow-hidden">
				<div className="flex-1 overflow-y-auto p-6">
					{view === "providers" && (
						<ProviderList cli={activeCLI} onEdit={handleEdit} onAdd={handleAdd} />
					)}
					{(view === "add-provider" || view === "edit-provider") && (
						<ProviderForm
							cli={activeCLI}
							provider={editingProvider}
							onSave={handleBack}
							onCancel={handleBack}
						/>
					)}
				</div>
				<StatusBar />
			</main>
		</div>
	);
}

export default App;
