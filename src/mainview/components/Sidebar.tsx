import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { Terminal, Plus, Settings as SettingsIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const CLI_COLORS: Record<string, string> = {
	claude: "#d97757",
	codex: "#10a37f",
	gemini: "#4285f4",
};

export function Sidebar() {
	const snap = useSnapshot(store);

	return (
		<div className="flex h-full">
			{/* Agent Rail — Discord server icon style */}
			<div className="w-[72px] bg-[#111113] border-r border-border flex flex-col items-center pt-2 gap-2">
				{snap.agents.map((agent) => {
					const isActive = snap.activeAgentId === agent.id && snap.view === "terminal";
					const hasSession = !!snap.terminalSessions[agent.id];
					const color = agent.color || CLI_COLORS[agent.cli] || "#71717a";

					return (
						<div key={agent.id} className="relative group">
							{/* Active indicator bar */}
							<div className={cn(
								"absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-foreground transition-all",
								isActive ? "h-9" : hasSession ? "h-5" : "h-2 opacity-0 group-hover:opacity-100 group-hover:h-5"
							)} />
							<button
								onClick={() => actions.openAgent(agent.id)}
								className={cn(
									"w-12 h-12 rounded-[24px] flex items-center justify-center text-lg transition-all duration-150",
									isActive ? "rounded-[16px]" : "hover:rounded-[16px]"
								)}
								style={{ background: isActive ? color : `${color}33` }}
								title={agent.name}
							>
								<span>{agent.icon || "🤖"}</span>
								{/* Status dot */}
								{hasSession && (
									<span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-[3px] border-[#111113]" />
								)}
							</button>
						</div>
					);
				})}

				{/* Divider */}
				<div className="w-8 h-0.5 bg-border rounded-full my-1" />

				{/* Add agent button */}
				<button
					onClick={() => actions.showAddAgent()}
					className="w-12 h-12 rounded-[24px] border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:rounded-[16px] hover:border-green-500 hover:text-green-500 transition-all"
					title="Add Agent"
				>
					<Plus className="w-5 h-5" />
				</button>
			</div>

			{/* Channel sidebar */}
			<aside className="w-52 border-r border-border bg-secondary flex flex-col">
				<div className="p-4 border-b border-border">
					<h1 className="text-base font-semibold tracking-tight flex items-center gap-2">
						<Terminal className="w-4 h-4" />
						ClawFlow
					</h1>
					<p className="text-xs text-muted-foreground mt-0.5">AI CLI Manager</p>
				</div>

				<nav className="flex-1 p-2 space-y-1 overflow-y-auto">
					{/* Active agent info */}
					{snap.activeAgentId && snap.view === "terminal" && (() => {
						const agent = snap.agents.find(a => a.id === snap.activeAgentId);
						if (!agent) return null;
						const provider = snap.providers.find(p => p.id === agent.providerId);
						return (
							<div className="px-3 py-3 mb-2 rounded-lg bg-background/50">
								<div className="text-sm font-medium">{agent.name}</div>
								<div className="text-xs text-muted-foreground mt-1">
									{agent.cli} · {provider?.name || "No provider"}
								</div>
								{agent.workDir && (
									<div className="text-xs text-muted-foreground font-mono mt-1 truncate">
										{agent.workDir}
									</div>
								)}
							</div>
						);
					})()}

					<p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Configure
					</p>
					{(["providers", "mcp", "prompts", "settings"] as const).map((view) => {
						const labels = { providers: "Providers", mcp: "MCP Servers", prompts: "Prompts", settings: "Settings" };
						const icons = { providers: "🔑", mcp: "🔌", prompts: "📝", settings: "⚙️" };
						const currentView = store.view.startsWith("add-") || store.view.startsWith("edit-")
							? store.view.includes("mcp") ? "mcp" : "providers"
							: store.view;
						return (
							<button
								key={view}
								onClick={() => actions.showView(view)}
								className={cn(
									"w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
									currentView === view
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:text-foreground hover:bg-background/50"
								)}
							>
								<span className="w-4 text-center">{icons[view]}</span>
								{labels[view]}
							</button>
						);
					})}
				</nav>

				<div className="p-3 border-t border-border">
					<ThemeToggle />
				</div>
			</aside>
		</div>
	);
}
