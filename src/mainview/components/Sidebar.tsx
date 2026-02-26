import type { CLIType } from "../types";

const CLI_ITEMS: { id: CLIType; label: string; icon: string; color: string }[] = [
	{ id: "claude", label: "Claude Code", icon: "🟠", color: "text-orange-500" },
	{ id: "codex", label: "Codex", icon: "🟢", color: "text-green-500" },
	{ id: "gemini", label: "Gemini", icon: "🔵", color: "text-blue-500" },
];

interface SidebarProps {
	activeCLI: CLIType;
	onSelectCLI: (cli: CLIType) => void;
	onAdd: () => void;
}

export function Sidebar({ activeCLI, onSelectCLI, onAdd }: SidebarProps) {
	return (
		<aside className="w-56 border-r border-[var(--border)] bg-[var(--secondary)] flex flex-col">
			{/* Logo */}
			<div className="p-4 border-b border-[var(--border)]">
				<h1 className="text-lg font-semibold tracking-tight">⚡ ClawFlow</h1>
				<p className="text-xs text-[var(--muted-foreground)] mt-0.5">AI CLI Manager</p>
			</div>

			{/* CLI List */}
			<nav className="flex-1 p-2 space-y-1">
				<p className="px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
					CLI Tools
				</p>
				{CLI_ITEMS.map((item) => (
					<button
						key={item.id}
						onClick={() => onSelectCLI(item.id)}
						className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
							activeCLI === item.id
								? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
								: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/50"
						}`}
					>
						<span className="text-base">{item.icon}</span>
						{item.label}
					</button>
				))}
			</nav>

			{/* Add Button */}
			<div className="p-3 border-t border-[var(--border)]">
				<button
					onClick={onAdd}
					className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
				>
					<span>+</span> Add Provider
				</button>
			</div>
		</aside>
	);
}
