import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Play, Square, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
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
					<h2 className="text-base font-semibold text-foreground">CLI Processes</h2>
					<p className="text-xs text-muted-foreground mt-0.5">Start, stop, and monitor CLI tools</p>
				</div>
				<Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
					<RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
				</Button>
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
									isRunning ? "bg-success animate-pulse" : "bg-muted-foreground/40"
								)} />
								<div>
									<h3 className="text-sm font-medium text-foreground">{cli.label}</h3>
									<p className="text-[10px] text-muted-foreground">
										{isRunning && proc ? `PID ${proc.pid} · ${formatUptime(proc.startedAt)}` : "Not running"}
									</p>
								</div>
							</div>
							{isRunning ? (
								<Button variant="destructive" size="sm" onClick={() => handleStop(cli.id)}>
									<Square className="w-3 h-3" /> Stop
								</Button>
							) : (
								<Button variant="success" size="sm" onClick={() => handleStart(cli.id)}>
									<Play className="w-3 h-3" /> Start
								</Button>
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
