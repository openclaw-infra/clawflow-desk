import { spawn, type Subprocess } from "bun";

interface TerminalSession {
	id: string;
	agentId: string;
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

export function terminalSpawn(agentId: string, cli: string, env: Record<string, string>, workDir?: string): { sessionId: string } {
	const id = `term-${++sessionCounter}`;

	// Kill existing session for this agent
	for (const [sid, s] of sessions) {
		if (s.agentId === agentId) {
			s.proc.kill();
			sessions.delete(sid);
		}
	}

	const proc = spawn([cli], {
		stdin: "pipe",
		stdout: "pipe",
		stderr: "pipe",
		env: { ...process.env, ...env },
		cwd: workDir || process.env.HOME,
	});

	const session: TerminalSession = { id, agentId, cli, proc, startedAt: Date.now() };
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
	// Placeholder for future PTY support
}

export function terminalKill(sessionId: string): void {
	const session = sessions.get(sessionId);
	if (!session) return;
	session.proc.kill();
	sessions.delete(sessionId);
}

export function getSessionByAgent(agentId: string): string | null {
	for (const [sid, s] of sessions) {
		if (s.agentId === agentId) return sid;
	}
	return null;
}

export function killAllTerminals(): void {
	for (const [, session] of sessions) {
		session.proc.kill();
	}
	sessions.clear();
}
