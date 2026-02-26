import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { store, actions } from "./store";
import { Sidebar } from "./components/Sidebar";
import { ProviderList } from "./components/ProviderList";
import { ProviderForm } from "./components/ProviderForm";
import { StatusBar } from "./components/StatusBar";

function App() {
	const snap = useSnapshot(store);

	useEffect(() => {
		actions.init();
	}, []);

	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<main className="flex-1 flex flex-col overflow-hidden">
				<div className="flex-1 overflow-y-auto p-6">
					{snap.view === "providers" && <ProviderList />}
					{(snap.view === "add-provider" || snap.view === "edit-provider") && (
						<ProviderForm />
					)}
				</div>
				<StatusBar />
			</main>
		</div>
	);
}

export default App;
