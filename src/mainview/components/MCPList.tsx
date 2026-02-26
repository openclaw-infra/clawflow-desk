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
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-lg font-semibold">MCP Servers</h2>
					<p className="text-sm text-muted-foreground mt-1 font-mono">{configPath}</p>
				</div>
				<button
					onClick={() => actions.showAddMCP()}
					className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
				>
					<Plus className="w-4 h-4" />
					Add Server
				</button>
			</div>

			{servers.length === 0 ? (
				<div className="text-center py-12 text-muted-foreground">
					<Terminal className="w-12 h-12 mx-auto mb-3 opacity-40" />
					<p>No MCP servers configured</p>
					<p className="text-sm mt-1">Add a server to get started</p>
				</div>
			) : (
				<div className="space-y-3">
					{servers.map((server) => (
						<div
							key={server.name}
							className={cn(
								"p-4 rounded-lg border transition-colors",
								server.disabled
									? "bg-muted/50 border-border opacity-60"
									: "bg-card border-border hover:border-primary/30"
							)}
						>
							<div className="flex items-center justify-between">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className={cn(
											"w-2 h-2 rounded-full",
											server.disabled ? "bg-muted-foreground" : "bg-green-500"
										)} />
										<h3 className="font-medium truncate">{server.name}</h3>
									</div>
									<p className="text-sm text-muted-foreground mt-1 font-mono truncate">
										{server.command} {server.args?.join(" ") || ""}
									</p>
									{server.env && Object.keys(server.env).length > 0 && (
										<p className="text-xs text-muted-foreground mt-1">
											{Object.keys(server.env).length} env var{Object.keys(server.env).length > 1 ? "s" : ""}
										</p>
									)}
								</div>
								<div className="flex items-center gap-1 ml-3">
									<button
										onClick={() => actions.toggleMCPServer(server.name, !server.disabled)}
										className="p-2 rounded-md hover:bg-accent transition-colors"
										title={server.disabled ? "Enable" : "Disable"}
									>
										{server.disabled ? (
											<PowerOff className="w-4 h-4 text-muted-foreground" />
										) : (
											<Power className="w-4 h-4 text-green-500" />
										)}
									</button>
									<button
										onClick={() => actions.showEditMCP({ ...server })}
										className="p-2 rounded-md hover:bg-accent transition-colors"
										title="Edit"
									>
										<Pencil className="w-4 h-4" />
									</button>
									<button
										onClick={() => actions.deleteMCPServer(server.name)}
										className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
										title="Delete"
									>
										<Trash2 className="w-4 h-4 text-destructive" />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
