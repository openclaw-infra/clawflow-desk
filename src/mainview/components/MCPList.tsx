import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { Plus, Trash2, Power, PowerOff, Pencil, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

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
					<h2 className="text-base font-semibold text-foreground">MCP Servers</h2>
					<p className="text-xs text-muted-foreground mt-0.5 font-mono">{configPath}</p>
				</div>
				<Button onClick={() => actions.showAddMCP()}>
					<Plus className="w-3.5 h-3.5" /> Add Server
				</Button>
			</div>

			{servers.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="w-16 h-16 rounded-full bg-input flex items-center justify-center mb-4">
						<Terminal className="w-8 h-8 text-muted-foreground" />
					</div>
					<p className="text-sm text-muted-foreground">No MCP servers configured</p>
					<p className="text-xs text-muted-foreground mt-1">Add a server to get started</p>
				</div>
			) : (
				<div className="space-y-1">
					{servers.map((server) => (
						<div
							key={server.name}
							className={cn(
								"group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
								server.disabled ? "opacity-50" : "hover:bg-[var(--color-channel-hover)]"
							)}
						>
							<div className={cn(
								"w-2 h-2 rounded-full shrink-0",
								server.disabled ? "bg-muted-foreground" : "bg-success"
							)} />
							<div className="flex-1 min-w-0">
								<h3 className="text-sm font-medium text-foreground truncate">{server.name}</h3>
								<p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
									{server.command} {server.args?.join(" ") || ""}
								</p>
							</div>
							<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
								<Button variant="ghost" size="icon-sm" onClick={() => actions.toggleMCPServer(server.name, !server.disabled)}
									title={server.disabled ? "Enable" : "Disable"}>
									{server.disabled ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5 text-success" />}
								</Button>
								<Button variant="ghost" size="icon-sm" onClick={() => actions.showEditMCP({ ...server })}>
									<Pencil className="w-3.5 h-3.5" />
								</Button>
								<Button variant="ghost" size="icon-sm" className="hover:text-destructive hover:bg-destructive/10"
									onClick={() => actions.deleteMCPServer(server.name)}>
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
