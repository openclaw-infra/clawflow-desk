import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { api } from "../lib/api";
import { RotateCcw, Square, Trash2, Play } from "lucide-react";
import type { AgentInstance } from "../../shared/types";
import "xterm/css/xterm.css";

interface Props {
	agent: AgentInstance;
	active: boolean;
}

export function TerminalView({ agent, active }: Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const termRef = useRef<Terminal | null>(null);
	const fitRef = useRef<FitAddon | null>(null);
	const sessionRef = useRef<string | null>(null);
	const [status, setStatus] = useState<"idle" | "running" | "exited">("idle");

	useEffect(() => {
		if (!containerRef.current) return;

		const term = new Terminal({
			theme: {
				background: "#1e1f22",
				foreground: "#dbdee1",
				cursor: "#f2f3f5",
				selectionBackground: "#5865f244",
				black: "#1e1f22",
				red: "#ed4245",
				green: "#57f287",
				yellow: "#fee75c",
				blue: "#5865f2",
				magenta: "#eb459e",
				cyan: "#00b0f4",
				white: "#f2f3f5",
				brightBlack: "#4f545c",
				brightRed: "#ed4245",
				brightGreen: "#57f287",
				brightYellow: "#fee75c",
				brightBlue: "#5865f2",
				brightMagenta: "#eb459e",
				brightCyan: "#00b0f4",
				brightWhite: "#ffffff",
			},
			fontFamily: "'SF Mono', Monaco, 'Cascadia Code', 'Fira Code', monospace",
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

		term.onData((data) => {
			if (sessionRef.current) {
				api.terminalWrite(sessionRef.current, data);
			}
		});

		const handleData = (e: Event) => {
			const { sessionId, data } = (e as CustomEvent).detail;
			if (sessionId === sessionRef.current) term.write(data);
		};

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

		const ro = new ResizeObserver(() => fit.fit());
		ro.observe(containerRef.current);

		return () => {
			window.removeEventListener("clawflow:terminal-data", handleData);
			window.removeEventListener("clawflow:terminal-exit", handleExit);
			ro.disconnect();
			term.dispose();
		};
	}, []);

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
		term.writeln(`\x1b[36mStarting ${agent.name}...\x1b[0m\r\n`);
		setStatus("running");
		try {
			const { sessionId } = await api.terminalSpawn(agent.id);
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

	useEffect(() => {
		if (status === "idle") handleStart();
	}, []);

	return (
		<div className="flex flex-col h-full bg-[#1e1f22]">
			{/* Terminal toolbar */}
			<div className="flex items-center justify-between px-3 py-1.5 bg-[#2b2d31] border-b border-[var(--color-border)]">
				<div className="flex items-center gap-2">
					<span className={`w-2 h-2 rounded-full ${status === "running" ? "bg-[var(--color-success)] animate-pulse" : "bg-[var(--color-muted-foreground)]/40"}`} />
					<span className="text-xs font-medium text-[var(--color-foreground)]">{agent.name}</span>
					<span className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wider">
						{status === "running" ? "Running" : status === "exited" ? "Exited" : "Starting..."}
					</span>
					{agent.workDir && (
						<span className="text-[10px] text-[var(--color-muted-foreground)] font-mono ml-1">{agent.workDir}</span>
					)}
				</div>
				<div className="flex items-center gap-0.5">
					<button onClick={() => termRef.current?.clear()} className="p-1 rounded hover:bg-[var(--color-accent)] transition-colors" title="Clear">
						<Trash2 className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
					</button>
					<button onClick={handleRestart} className="p-1 rounded hover:bg-[var(--color-accent)] transition-colors" title="Restart">
						<RotateCcw className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
					</button>
					{status === "running" ? (
						<button onClick={handleStop} className="p-1 rounded hover:bg-[var(--color-destructive)]/10 transition-colors" title="Stop">
							<Square className="w-3.5 h-3.5 text-[var(--color-destructive)]" />
						</button>
					) : (
						<button onClick={handleStart} className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--color-success)]/15 text-[var(--color-success)] hover:bg-[var(--color-success)]/25 transition-colors">
							<Play className="w-3 h-3" /> Start
						</button>
					)}
				</div>
			</div>
			{/* Terminal container */}
			<div ref={containerRef} className="flex-1 px-1 pt-1" style={{ minHeight: 0 }} />
		</div>
	);
}
