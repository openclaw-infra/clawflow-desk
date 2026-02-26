import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { Terminal, Bot, Cpu, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import type { CLIType } from "../types";

const AGENTS: { id: CLIType; label: string; icon: typeof Terminal }[] = [
	{ id: "claude", label: "Claude Code", icon: Bot },
	{ id: "codex", label: "Codex", icon: Cpu },
	{ id: "gemini", label: "Gemini CLI", icon: Sparkles },
];

export function Sidebar() {
	const snap = useSnapshot(store);
	const isSettings = snap.view !== "terminal";

	return (
		<aside className="w-56 border-r border-border bg-secondary flex flex-col">
			<div className="p-4 border-b border-border">
				<h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
					<Terminal className="w-5 h-5" />
					ClawFlow
				</h1>
				<p className="text-xs text-muted-foreground mt-0.5">AI CLI Manager</p>
			</div>

			<nav className="flex-1 p-2 space-y-1 overflow-y-auto">
				<p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
					Agents
				</p>
				{AGENTS.map((agent) => {
					const Icon = agent.icon;
					const isActive = snap.activeCLI === agent.id && snap.view === "terminal";
					return (
						<button
							key={agent.id}
							onClick={() => actions.openAgent(agent.id)}
							className={cn(
								"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
								isActive
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground hover:bg-background/50"
							)}
						>
							<Icon className="w-4 h-4" />
							{agent.label}
							{snap.terminalSessions[agent.id] && (
								<span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
							)}
						</button>
					);
				})}

				<div className="pt-3">
					<p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Configure
					</p>
					{(["providers", "mcp", "prompts", "settings"] as const).map((view) => {
						const labels = { providers: "Providers", mcp: "MCP Servers", prompts: "Prompts", settings: "Settings" };
						const icons = { providers: "🔑", mcp: "🔌", prompts: "📝", settings: "⚙️" };
						const currentView = snap.view.startsWith("add-") || snap.view.startsWith("edit-")
							? snap.view.includes("mcp") ? "mcp" : "providers"
							: snap.view;
						return (
							<button
								key={view}
								onClick={() => actions.showView(view)}
								className={cn(
									"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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
				</div>
			</nav>

			<div className="p-3 border-t border-border">
				<ThemeToggle />
			</div>
		</aside>
	);
}
