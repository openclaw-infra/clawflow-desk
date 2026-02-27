import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { Plus, Pencil, Trash2, Zap, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const CLI_LABELS = { claude: "Claude Code", codex: "Codex", gemini: "Gemini CLI" } as const;

export function ProviderList() {
	const snap = useSnapshot(store);
	const providers = snap.providers.filter((p) => p.cli === snap.activeCLI);

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-base font-semibold text-foreground">
						{CLI_LABELS[snap.activeCLI]} Providers
					</h2>
					<p className="text-xs text-muted-foreground mt-0.5">
						Manage API providers for {CLI_LABELS[snap.activeCLI]}
					</p>
				</div>
				<Button onClick={actions.showAddProvider} size="default">
					<Plus className="w-3.5 h-3.5" /> Add Provider
				</Button>
			</div>

			{providers.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="w-16 h-16 rounded-full bg-input flex items-center justify-center mb-4">
						<Inbox className="w-8 h-8 text-muted-foreground" />
					</div>
					<p className="text-sm text-muted-foreground mb-3">
						No providers configured for {CLI_LABELS[snap.activeCLI]}
					</p>
					<Button onClick={actions.showAddProvider}>Add your first provider</Button>
				</div>
			) : (
				<div className="space-y-2">
					{providers.map((provider) => (
						<div
							key={provider.id}
							className={cn(
								"group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
								provider.isActive
									? "bg-success/10 border border-success/20"
									: "bg-card hover:bg-[var(--color-channel-hover)]"
							)}
						>
							<div className={cn(
								"w-2 h-2 rounded-full shrink-0",
								provider.isActive ? "bg-success" : "bg-muted-foreground/40"
							)} />

							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-foreground">{provider.name}</span>
									{provider.isActive && <Badge variant="success">Active</Badge>}
								</div>
								<div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-mono">
									<span>{provider.apiKey.slice(0, 8)}***</span>
									{provider.baseUrl && <span>· {provider.baseUrl}</span>}
									{provider.model && <span>· {provider.model}</span>}
								</div>
							</div>

							<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
								{!provider.isActive && (
									<Button variant="default" size="sm" onClick={() => actions.activateProvider(snap.activeCLI, provider.id)}>
										<Zap className="w-3 h-3" /> Activate
									</Button>
								)}
								<Button variant="ghost" size="icon-sm" onClick={() => actions.showEditProvider({ ...provider })}>
									<Pencil className="w-3.5 h-3.5" />
								</Button>
								<Button variant="ghost" size="icon-sm" className="hover:text-destructive hover:bg-destructive/10"
									onClick={() => { if (confirm(`Delete "${provider.name}"?`)) actions.deleteProvider(provider.id); }}>
									<Trash2 className="w-3.5 h-3.5" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
