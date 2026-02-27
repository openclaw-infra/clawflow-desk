import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { Plus, Trash2, Power, PowerOff, Pencil, Terminal } from "lucide-react";
import { cn } from "../lib/utils";

export function MCPList() {
	const snap = useSnapshot(store);

	useEffect(() => {
		actions.loadMCPConfig();
	}, [snap.activeCLI]);

	const servers = snap.mcpConfig?.servers || [];
	const configPath = snap.mcpConfig?.configPath || "";

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-base font-semibold text-[var(--color-foreground)]">MCP Servers</h2>
					<p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 font-mono">{configPath}</p>
				</div>
				<button
					onClick={() => actions.showAddMCP()}
					className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-brand-hover)] transition-colors"
				>
					<Plus className="w-3.5 h-3.5" /> Add Server
				</button>
			</div>

			{servers.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="w-16 h-16 rounded-full bg-[var(--color-input)] flex items-center justify-center mb-4">
						<Terminal className="w-8 h-8 text-[var(--color-muted-foreground)]" />
					</div>
					<p className="text-sm text-[var(--color-muted-foreground)]">No MCP servers configured</p>
					<p className="text-xs text-[var(--color-muted-foreground)] mt-1">Add a server to get started</p>
				</div>
			) : (
				<div className="space-y-1">
					{servers.map((server) => (
						<div
							key={server.name}
							className={cn(
								"group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
								server.disabled
									? "opacity-50"
									: "hover:bg-[var(--color-channel-hover)]"
							)}
						>
							<div className={cn(
								"w-2 h-2 rounded-full shrink-0",
								server.disabled ? "bg-[var(--color-muted-foreground)]" : "bg-[var(--color-success)]"
							)} />

							<div className="flex-1 min-w-0">
								<h3 className="text-sm font-medium text-[var(--color-foreground)] truncate">{server.name}</h3>
								<p className="text-xs text-[var(--color-muted-foreground)] font-mono truncate mt-0.5">
									{server.command} {server.args?.join(" ") || ""}
								</p>
								{server.env && Object.keys(server.env).length > 0 && (
									<p className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">
										{Object.keys(server.env).length} env var{Object.keys(server.env).length > 1 ? "s" : ""}
									</p>
								)}
							</div>

							<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									onClick={() => actions.toggleMCPServer(server.name, !server.disabled)}
									className="p-1.5 rounded text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors"
									title={server.disabled ? "Enable" : "Disable"}
								>
									{server.disabled ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5 text-[var(--color-success)]" />}
								</button>
								<button
									onClick={() => actions.showEditMCP({ ...server })}
									className="p-1.5 rounded text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors"
									title="Edit"
								>
									<Pencil className="w-3.5 h-3.5" />
								</button>
								<button
									onClick={() => actions.deleteMCPServer(server.name)}
									className="p-1.5 rounded text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 transition-colors"
									title="Delete"
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
