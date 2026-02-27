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
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-base font-semibold text-[var(--color-foreground)]">
						{CLI_LABELS[snap.activeCLI]} Providers
					</h2>
					<p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
						Manage API providers for {CLI_LABELS[snap.activeCLI]}
					</p>
				</div>
				<button
					onClick={actions.showAddProvider}
					className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-brand-hover)] transition-colors"
				>
					<Plus className="w-3.5 h-3.5" /> Add Provider
				</button>
			</div>

			{providers.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="w-16 h-16 rounded-full bg-[var(--color-input)] flex items-center justify-center mb-4">
						<Inbox className="w-8 h-8 text-[var(--color-muted-foreground)]" />
					</div>
					<p className="text-sm text-[var(--color-muted-foreground)] mb-3">
						No providers configured for {CLI_LABELS[snap.activeCLI]}
					</p>
					<button
						onClick={actions.showAddProvider}
						className="px-3 py-1.5 rounded text-xs font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-brand-hover)] transition-colors"
					>
						Add your first provider
					</button>
				</div>
			) : (
				<div className="space-y-2">
					{providers.map((provider) => (
						<div
							key={provider.id}
							className={cn(
								"group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
								provider.isActive
									? "bg-[var(--color-success)]/10 border border-[var(--color-success)]/20"
									: "bg-[var(--color-card)] hover:bg-[var(--color-channel-hover)]"
							)}
						>
							<div className={cn(
								"w-2 h-2 rounded-full shrink-0",
								provider.isActive ? "bg-[var(--color-success)]" : "bg-[var(--color-muted-foreground)]/40"
							)} />

							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-[var(--color-foreground)]">{provider.name}</span>
									{provider.isActive && (
										<span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-success)]/15 text-[var(--color-success)] font-medium uppercase tracking-wider">
											Active
										</span>
									)}
								</div>
								<div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--color-muted-foreground)] font-mono">
									<span>{provider.apiKey.slice(0, 8)}***</span>
									{provider.baseUrl && <span>· {provider.baseUrl}</span>}
									{provider.model && <span>· {provider.model}</span>}
								</div>
							</div>

							<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
								{!provider.isActive && (
									<button
										onClick={() => actions.activateProvider(snap.activeCLI, provider.id)}
										className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-brand-hover)] transition-colors"
									>
										<Zap className="w-3 h-3" /> Activate
									</button>
								)}
								<button
									onClick={() => actions.showEditProvider({ ...provider })}
									className="p-1.5 rounded text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors"
								>
									<Pencil className="w-3.5 h-3.5" />
								</button>
								<button
									onClick={() => { if (confirm(`Delete "${provider.name}"?`)) actions.deleteProvider(provider.id); }}
									className="p-1.5 rounded text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 transition-colors"
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
