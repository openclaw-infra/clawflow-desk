import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { api } from "../lib/api";
import { RotateCcw, Square, Trash2 } from "lucide-react";
import "xterm/css/xterm.css";

interface Props {
	cli: "claude" | "codex" | "gemini";
	active: boolean;
}

export function TerminalView({ cli, active }: Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const termRef = useRef<Terminal | null>(null);
	const fitRef = useRef<FitAddon | null>(null);
	const sessionRef = useRef<string | null>(null);
	const [status, setStatus] = useState<"idle" | "running" | "exited">("idle");

	useEffect(() => {
		if (!containerRef.current) return;

		const term = new Terminal({
			theme: {
				background: "#1a1a1f",
				foreground: "#fafafa",
				cursor: "#fafafa",
				selectionBackground: "#3b82f644",
				black: "#1a1a1f",
				red: "#ef4444",
				green: "#22c55e",
				yellow: "#f59e0b",
				blue: "#3b82f6",
				magenta: "#a855f7",
				cyan: "#06b6d4",
				white: "#fafafa",
			},
			fontFamily: "'SF Mono', Monaco, 'Cascadia Code', monospace",
			fontSize: 13,
			lineHeight: 1.4,
			cursorBlink: true,
			cursorStyle: "bar",
			scrollback: 5000,
		});

		const fit = new FitAddon();
		term.loadAddon(fit);
		term.loadAddon(new WebLinksAddon());
		term.open(containerRef.current);
		fit.fit();

		termRef.current = term;
		fitRef.current = fit;

		// Handle user input → send to backend
		term.onData((data) => {
			if (sessionRef.current) {
				api.terminalWrite(sessionRef.current, data);
			}
		});

		// Handle terminal data from backend
		const handleData = (e: Event) => {
			const { sessionId, data } = (e as CustomEvent).detail;
			if (sessionId === sessionRef.current) {
				term.write(data);
			}
		};

		// Handle terminal exit
		const handleExit = (e: Event) => {
			const { sessionId, code } = (e as CustomEvent).detail;
			if (sessionId === sessionRef.current) {
				term.writeln(`\r\n\x1b[90m[Process exited with code ${code}]\x1b[0m`);
				setStatus("exited");
				sessionRef.current = null;
			}
		};

		window.addEventListener("clawflow:terminal-data", handleData);
		window.addEventListener("clawflow:terminal-exit", handleExit);

		// Resize observer
		const ro = new ResizeObserver(() => fit.fit());
		ro.observe(containerRef.current);

		return () => {
			window.removeEventListener("clawflow:terminal-data", handleData);
			window.removeEventListener("clawflow:terminal-exit", handleExit);
			ro.disconnect();
			term.dispose();
		};
	}, []);

	// Focus terminal when tab becomes active
	useEffect(() => {
		if (active && termRef.current) {
			termRef.current.focus();
			fitRef.current?.fit();
		}
	}, [active]);

	const handleStart = async () => {
		const term = termRef.current;
		if (!term) return;
		term.clear();
		term.writeln(`\x1b[36mStarting ${cli}...\x1b[0m\r\n`);
		setStatus("running");
		try {
			const { sessionId } = await api.terminalSpawn(cli);
			sessionRef.current = sessionId;
		} catch (e: any) {
			term.writeln(`\x1b[31mFailed to start: ${e.message}\x1b[0m`);
			setStatus("exited");
		}
	};

	const handleStop = async () => {
		if (sessionRef.current) {
			await api.terminalKill(sessionRef.current);
			sessionRef.current = null;
			setStatus("exited");
		}
	};

	const handleRestart = async () => {
		await handleStop();
		await handleStart();
	};

	const handleClear = () => {
		termRef.current?.clear();
	};

	// Auto-start on first mount
	useEffect(() => {
		if (status === "idle") {
			handleStart();
		}
	}, []);

	const cliLabels = { claude: "Claude Code", codex: "Codex", gemini: "Gemini CLI" };

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between px-4 py-2 border-b border-border">
				<div className="flex items-center gap-2">
					<span className={`w-2 h-2 rounded-full ${status === "running" ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"}`} />
					<span className="text-sm font-medium">{cliLabels[cli]}</span>
					<span className="text-xs text-muted-foreground">
						{status === "running" ? "Running" : status === "exited" ? "Exited" : "Starting..."}
					</span>
				</div>
				<div className="flex items-center gap-1">
					<button onClick={handleClear} className="p-1.5 rounded-md hover:bg-accent transition-colors" title="Clear">
						<Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
					</button>
					<button onClick={handleRestart} className="p-1.5 rounded-md hover:bg-accent transition-colors" title="Restart">
						<RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
					</button>
					{status === "running" && (
						<button onClick={handleStop} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" title="Stop">
							<Square className="w-3.5 h-3.5 text-destructive" />
						</button>
					)}
					{status !== "running" && (
						<button onClick={handleStart} className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20 transition-colors">
							Start
						</button>
					)}
				</div>
			</div>
			<div ref={containerRef} className="flex-1 p-1" style={{ minHeight: 0 }} />
		</div>
	);
}
