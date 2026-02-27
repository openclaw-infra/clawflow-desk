import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { Plus, Mic, Bell, Settings as SettingsIcon, Hash } from "lucide-react";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const CLI_COLORS: Record<string, string> = {
	claude: "#d97757",
	codex: "#10a37f",
	gemini: "#4285f4",
};

const CLI_SVGS: Record<string, JSX.Element> = {
	claude: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#fff" strokeWidth="1.5"/></svg>,
	codex: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
	gemini: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.64 5.64l2.12 2.12m8.49 8.49l2.12 2.12M18.36 5.64l-2.12 2.12M7.76 16.24l-2.12 2.12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

export function Sidebar() {
	const snap = useSnapshot(store);
	const activeAgent = snap.agents.find(a => a.id === snap.activeAgentId);
	const provider = activeAgent ? snap.providers.find(p => p.id === activeAgent.providerId) : null;

	return (
		<div className="flex h-full">
			{/* Agent Rail */}
			<div className="w-[72px] bg-[#1e1f22] flex flex-col items-center pt-3 gap-2 pb-2">
				{snap.agents.map((agent) => {
					const isActive = snap.activeAgentId === agent.id && snap.view === "terminal";
					const hasSession = !!snap.terminalSessions[agent.id];
					const color = agent.color || CLI_COLORS[agent.cli] || "#71717a";

					return (
						<div key={agent.id} className="relative group">
							{/* Active indicator pill */}
							<div className={cn(
								"absolute left-[-4px] top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all duration-150",
								isActive ? "h-10" : hasSession ? "h-5" : "h-0 group-hover:h-5"
							)} />
							<button
								onClick={() => actions.openAgent(agent.id)}
								className={cn(
									"w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 relative",
									isActive ? "rounded-2xl" : "hover:rounded-2xl"
								)}
								style={{ background: isActive ? color : `${color}${isActive ? '' : '66'}` }}
								title={agent.name}
							>
								{CLI_SVGS[agent.cli] || <span className="text-lg">{agent.icon || "🤖"}</span>}
								{/* Status badge */}
								<div className={cn(
									"absolute bottom-[-2px] right-[-2px] w-4 h-4 rounded-full border-[3px] border-[#1e1f22]",
									hasSession ? "bg-[#23a559]" : "bg-[#80848e]"
								)} />
							</button>
						</div>
					);
				})}

				{/* Separator */}
				<div className="w-8 h-0.5 bg-[#35363c] rounded-full my-1" />

				{/* Add agent */}
				<button
					onClick={() => actions.showAddAgent()}
					className="w-12 h-12 rounded-full bg-[#313338] text-[#23a559] text-2xl font-light flex items-center justify-center hover:rounded-2xl hover:bg-[#23a559] hover:text-white transition-all duration-150"
					title="Add Agent"
				>
					+
				</button>
			</div>

			{/* Channel Sidebar */}
			<aside className="w-60 bg-[#2b2d31] flex flex-col">
				{/* Header */}
				<div className="h-12 px-4 flex items-center border-b border-[#1f2023] shadow-[0_1px_0_rgba(0,0,0,.2)]">
					<h2 className="text-base font-semibold text-[#f2f3f5] flex-1">
						{activeAgent ? (activeAgent.cli === "claude" ? "Claude Code" : activeAgent.cli === "codex" ? "Codex" : "Gemini CLI") : "ClawFlow"}
					</h2>
					{activeAgent && snap.terminalSessions[activeAgent.id] && (
						<span className="text-[10px] px-1.5 py-0.5 rounded bg-[#23a55933] text-[#23a559] font-semibold">Online</span>
					)}
				</div>

				{/* Channel list */}
				<nav className="flex-1 overflow-y-auto py-2">
					{/* Sessions category */}
					<div className="px-4 pt-4 pb-1 text-[11px] font-bold text-[#949ba4] uppercase tracking-wide flex items-center gap-0.5">
						<svg width="12" height="12" viewBox="0 0 12 12" className="opacity-70"><path d="M2 4.5l4 3 4-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
						Sessions
					</div>
					{snap.agents.map((agent) => {
						const isActive = snap.activeAgentId === agent.id && snap.view === "terminal";
						return (
							<button
								key={agent.id}
								onClick={() => actions.openAgent(agent.id)}
								className={cn(
									"w-full flex items-center gap-1.5 px-2 py-1.5 mx-2 rounded text-[15px] cursor-pointer transition-colors",
									isActive
										? "bg-[#404249] text-[#f2f3f5]"
										: "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
								)}
								style={{ width: "calc(100% - 16px)" }}
							>
								<span className={cn("text-xl font-medium w-5 text-center flex-shrink-0", isActive ? "text-[#f2f3f5]" : "text-[#80848e]")}>#</span>
								<span className="font-medium truncate">{agent.name.toLowerCase().replace(/\s+/g, '-')}</span>
							</button>
						);
					})}

					{/* Configure category */}
					<div className="px-4 pt-5 pb-1 text-[11px] font-bold text-[#949ba4] uppercase tracking-wide flex items-center gap-0.5">
						<svg width="12" height="12" viewBox="0 0 12 12" className="opacity-70"><path d="M2 4.5l4 3 4-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
						Configure
					</div>
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
									"w-full flex items-center gap-1.5 px-2 py-1.5 mx-2 rounded text-[15px] cursor-pointer transition-colors",
									currentView === view
										? "bg-[#404249] text-[#f2f3f5]"
										: "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
								)}
								style={{ width: "calc(100% - 16px)" }}
							>
								<span className="text-sm w-5 text-center flex-shrink-0">{icons[view]}</span>
								<span className="font-medium">{labels[view]}</span>
							</button>
						);
					})}
				</nav>

				{/* User Panel */}
				<div className="h-[52px] bg-[#232428] px-2 flex items-center gap-2">
					<div className="relative">
						<div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-sm font-semibold text-white">
							K
						</div>
						<div className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 rounded-full bg-[#23a559] border-2 border-[#232428]" />
					</div>
					<div className="flex-1 min-w-0">
						<div className="text-[13px] font-semibold text-[#f2f3f5] leading-tight">Ken</div>
						<div className="text-[12px] text-[#949ba4] leading-tight truncate">
							{provider ? `${provider.model || provider.name}` : "No provider"}
						</div>
					</div>
					<div className="flex gap-0.5">
						<button className="w-8 h-8 rounded flex items-center justify-center text-[#b5bac1] hover:bg-[#35373c] hover:text-[#dbdee1] transition-colors">
							<Mic className="w-5 h-5" />
						</button>
						<button className="w-8 h-8 rounded flex items-center justify-center text-[#b5bac1] hover:bg-[#35373c] hover:text-[#dbdee1] transition-colors">
							<SettingsIcon className="w-5 h-5" />
						</button>
					</div>
				</div>
			</aside>
		</div>
	);
}
