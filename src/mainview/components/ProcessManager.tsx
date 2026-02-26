import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { store } from "../store";
import { api } from "../lib/api";
import { Play, Square, RefreshCw, Activity } from "lucide-react";
import { cn } from "../lib/utils";
import type { CLIProcess } from "../types";

export function ProcessManager() {
	const snap = useSnapshot(store);
	const [processes, setProcesses] = useState<CLIProcess[]>([]);
	const [loading, setLoading] = useState(false);

	const refresh = async () => {
		setLoading(true);
		try {
			setProcesses(await api.listCLIProcesses());
		} catch (e) {
			console.error("Failed to list processes:", e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		refresh();
		const interval = setInterval(refresh, 5000);
		return () => clearInterval(interval);
	}, []);

	const handleStart = async (cli: string) => {
		try {
			await api.startCLI(cli);
			await refresh();
		} catch (e) {
			console.error("Failed to start CLI:", e);
		}
	};

	const handleStop = async (cli: string) => {
		try {
			await api.stopCLI(cli);
			await refresh();
		} catch (e) {
			console.error("Failed to stop CLI:", e);
		}
	};

	const clis = [
		{ id: "claude", label: "Claude Code" },
		{ id: "codex", label: "Codex" },
		{ id: "gemini", label: "Gemini CLI" },
	] as const;

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-lg font-semibold">CLI Processes</h2>
					<p className="text-sm text-muted-foreground mt-1">Start, stop, and monitor CLI tools</p>
				</div>
				<button
					onClick={refresh}
					disabled={loading}
					className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-accent transition-colors disabled:opacity-50"
				>
					<RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
					Refresh
				</button>
			</div>

			<div className="space-y-3">
				{clis.map((cli) => {
					const proc = processes.find((p) => p.cli === cli.id);
					const isRunning = proc?.status === "running";

					return (
						<div
							key={cli.id}
							className="p-4 rounded-lg border bg-card border-border"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<span className={cn(
										"w-3 h-3 rounded-full",
										isRunning ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"
									)} />
									<div>
										<h3 className="font-medium">{cli.label}</h3>
										{isRunning && proc ? (
											<p className="text-xs text-muted-foreground mt-0.5">
												PID {proc.pid} · {formatUptime(proc.startedAt)}
											</p>
										) : (
											<p className="text-xs text-muted-foreground mt-0.5">Not running</p>
										)}
									</div>
								</div>
								<div className="flex items-center gap-2">
									{isRunning ? (
										<button
											onClick={() => handleStop(cli.id)}
											className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm hover:bg-destructive/20 transition-colors"
										>
											<Square className="w-4 h-4" />
											Stop
										</button>
									) : (
										<button
											onClick={() => handleStart(cli.id)}
											className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm hover:bg-green-500/20 transition-colors"
										>
											<Play className="w-4 h-4" />
											Start
										</button>
									)}
								</div>
							</div>
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
