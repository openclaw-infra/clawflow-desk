import { spawn, type Subprocess } from "bun";

interface TerminalSession {
	id: string;
	cli: string;
	proc: Subprocess;
	startedAt: number;
}

const sessions = new Map<string, TerminalSession>();
let sessionCounter = 0;

type DataCallback = (sessionId: string, data: string) => void;
type ExitCallback = (sessionId: string, code: number) => void;

let onData: DataCallback = () => {};
let onExit: ExitCallback = () => {};

export function setTerminalCallbacks(data: DataCallback, exit: ExitCallback) {
	onData = data;
	onExit = exit;
}

export function terminalSpawn(cli: string): { sessionId: string } {
	const id = `term-${++sessionCounter}`;

	// Kill existing session for this CLI
	for (const [sid, s] of sessions) {
		if (s.cli === cli) {
			s.proc.kill();
			sessions.delete(sid);
		}
	}

	const proc = spawn([cli], {
		stdin: "pipe",
		stdout: "pipe",
		stderr: "pipe",
		env: { ...process.env, TERM: "xterm-256color" },
	});

	const session: TerminalSession = { id, cli, proc, startedAt: Date.now() };
	sessions.set(id, session);

	// Stream stdout
	if (proc.stdout) {
		const reader = proc.stdout.getReader();
		const decoder = new TextDecoder();
		(async () => {
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					onData(id, decoder.decode(value));
				}
			} catch {}
		})();
	}

	// Stream stderr
	if (proc.stderr) {
		const reader = proc.stderr.getReader();
		const decoder = new TextDecoder();
		(async () => {
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					onData(id, decoder.decode(value));
				}
			} catch {}
		})();
	}

	// Watch for exit
	proc.exited.then((code) => {
		onExit(id, code ?? 1);
		sessions.delete(id);
	});

	return { sessionId: id };
}

export function terminalWrite(sessionId: string, data: string): void {
	const session = sessions.get(sessionId);
	if (!session?.proc.stdin) return;
	const writer = session.proc.stdin.getWriter();
	writer.write(new TextEncoder().encode(data));
	writer.releaseLock();
}

export function terminalResize(sessionId: string, cols: number, rows: number): void {
	// Bun subprocess doesn't support PTY resize natively
	// This is a placeholder for future PTY support
}

export function terminalKill(sessionId: string): void {
	const session = sessions.get(sessionId);
	if (!session) return;
	session.proc.kill();
	sessions.delete(sessionId);
}

export function killAllTerminals(): void {
	for (const [, session] of sessions) {
		session.proc.kill();
	}
	sessions.clear();
}
