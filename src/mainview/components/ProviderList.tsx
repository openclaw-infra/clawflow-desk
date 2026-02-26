import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { Plus, Pencil, Trash2, Zap, Inbox } from "lucide-react";
import { cn } from "../lib/utils";

const CLI_LABELS = { claude: "Claude Code", codex: "Codex", gemini: "Gemini CLI" } as const;

export function ProviderList() {
	const snap = useSnapshot(store);
	const providers = snap.providers.filter((p) => p.cli === snap.activeCLI);

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-xl font-semibold">{CLI_LABELS[snap.activeCLI]} Providers</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Manage API providers for {CLI_LABELS[snap.activeCLI]}
					</p>
				</div>
				<button
					onClick={actions.showAddProvider}
					className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
				>
					<Plus className="w-3.5 h-3.5" /> Add
				</button>
			</div>

			{providers.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<Inbox className="w-12 h-12 text-muted-foreground/40 mb-4" />
					<p className="text-muted-foreground mb-4">
						No providers configured for {CLI_LABELS[snap.activeCLI]}
					</p>
					<button
						onClick={actions.showAddProvider}
						className="px-4 py-2 rounded-lg text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
					>
						Add your first provider
					</button>
				</div>
			) : (
				<div className="space-y-3">
					{providers.map((provider) => (
						<div
							key={provider.id}
							className={cn(
								"group relative flex items-center gap-4 p-4 rounded-xl border transition-all",
								provider.isActive
									? "border-success/50 bg-success/5"
									: "border-border hover:border-muted-foreground/30"
							)}
						>
							<div
								className={cn(
									"w-2.5 h-2.5 rounded-full shrink-0",
									provider.isActive ? "bg-success" : "bg-muted-foreground/30"
								)}
							/>

							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<span className="font-medium text-sm">{provider.name}</span>
									{provider.isActive && (
										<span className="text-xs px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">
											Active
										</span>
									)}
								</div>
								<div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
									<span>Key: {provider.apiKey.slice(0, 8)}***</span>
									{provider.baseUrl && <span>URL: {provider.baseUrl}</span>}
									{provider.model && <span>Model: {provider.model}</span>}
								</div>
							</div>

							<div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
								{!provider.isActive && (
									<button
										onClick={() => actions.activateProvider(snap.activeCLI, provider.id)}
										className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
									>
										<Zap className="w-3 h-3" /> Activate
									</button>
								)}
								<button
									onClick={() => actions.showEditProvider({ ...provider })}
									className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								>
									<Pencil className="w-3.5 h-3.5" />
								</button>
								<button
									onClick={() => {
										if (confirm(`Delete "${provider.name}"?`)) {
											actions.deleteProvider(provider.id);
										}
									}}
									className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
								>
									<Trash2 className="w-3.5 h-3.5" />
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
