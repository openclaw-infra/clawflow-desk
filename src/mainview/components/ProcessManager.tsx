import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Play, Square, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";
import type { CLIProcess } from "../types";

export function ProcessManager() {
	const [processes, setProcesses] = useState<CLIProcess[]>([]);
	const [loading, setLoading] = useState(false);

	const refresh = async () => {
		setLoading(true);
		try { setProcesses(await api.listCLIProcesses()); } catch {}
		setLoading(false);
	};

	useEffect(() => {
		refresh();
		const interval = setInterval(refresh, 5000);
		return () => clearInterval(interval);
	}, []);

	const handleStart = async (cli: string) => { try { await api.startCLI(cli); await refresh(); } catch {} };
	const handleStop = async (cli: string) => { try { await api.stopCLI(cli); await refresh(); } catch {} };

	const clis = [
		{ id: "claude", label: "Claude Code" },
		{ id: "codex", label: "Codex" },
		{ id: "gemini", label: "Gemini CLI" },
	] as const;

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-base font-semibold text-[var(--color-foreground)]">CLI Processes</h2>
					<p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">Start, stop, and monitor CLI tools</p>
				</div>
				<button
					onClick={refresh}
					disabled={loading}
					className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors disabled:opacity-40"
				>
					<RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
				</button>
			</div>

			<div className="space-y-1">
				{clis.map((cli) => {
					const proc = processes.find((p) => p.cli === cli.id);
					const isRunning = proc?.status === "running";

					return (
						<div key={cli.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[var(--color-channel-hover)] transition-colors">
							<div className="flex items-center gap-3">
								<span className={cn(
									"w-2 h-2 rounded-full",
									isRunning ? "bg-[var(--color-success)] animate-pulse" : "bg-[var(--color-muted-foreground)]/40"
								)} />
								<div>
									<h3 className="text-sm font-medium text-[var(--color-foreground)]">{cli.label}</h3>
									{isRunning && proc ? (
										<p className="text-[10px] text-[var(--color-muted-foreground)]">
											PID {proc.pid} · {formatUptime(proc.startedAt)}
										</p>
									) : (
										<p className="text-[10px] text-[var(--color-muted-foreground)]">Not running</p>
									)}
								</div>
							</div>
							{isRunning ? (
								<button
									onClick={() => handleStop(cli.id)}
									className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-[var(--color-destructive)]/10 text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/20 transition-colors"
								>
									<Square className="w-3 h-3" /> Stop
								</button>
							) : (
								<button
									onClick={() => handleStart(cli.id)}
									className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20 transition-colors"
								>
									<Play className="w-3 h-3" /> Start
								</button>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function formatUptime(startedAt: number): string {
	const diff = Date.now() - startedAt;
	const secs = Math.floor(diff / 1000);
	if (secs < 60) return `${secs}s`;
	const mins = Math.floor(secs / 60);
	if (mins < 60) return `${mins}m ${secs % 60}s`;
	const hours = Math.floor(mins / 60);
	return `${hours}h ${mins % 60}m`;
}
