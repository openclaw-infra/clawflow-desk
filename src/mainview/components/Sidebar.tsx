import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { Terminal, Plus, Sparkles, Cpu, Bot } from "lucide-react";
import { cn } from "../lib/utils";
import type { CLIType } from "../types";

const CLI_ITEMS: { id: CLIType; label: string; icon: typeof Terminal }[] = [
	{ id: "claude", label: "Claude Code", icon: Bot },
	{ id: "codex", label: "Codex", icon: Cpu },
	{ id: "gemini", label: "Gemini", icon: Sparkles },
];

export function Sidebar() {
	const snap = useSnapshot(store);

	return (
		<aside className="w-56 border-r border-border bg-secondary flex flex-col">
			<div className="p-4 border-b border-border">
				<h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
					<Terminal className="w-5 h-5" />
					ClawFlow
				</h1>
				<p className="text-xs text-muted-foreground mt-0.5">AI CLI Manager</p>
			</div>

			<nav className="flex-1 p-2 space-y-1">
				<p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
					CLI Tools
				</p>
				{CLI_ITEMS.map((item) => {
					const Icon = item.icon;
					return (
						<button
							key={item.id}
							onClick={() => actions.selectCLI(item.id)}
							className={cn(
								"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
								snap.activeCLI === item.id
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground hover:bg-background/50"
							)}
						>
							<Icon className="w-4 h-4" />
							{item.label}
						</button>
					);
				})}
			</nav>

			<div className="p-3 border-t border-border">
				<button
					onClick={actions.showAddProvider}
					className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
				>
					<Plus className="w-4 h-4" />
					Add Provider
				</button>
			</div>
		</aside>
	);
}
