import { spawn, type Subprocess } from "bun";
import type { CLIType } from "./types";

export interface CLIProcess {
	cli: CLIType;
	pid: number;
	status: "running" | "stopped" | "error";
	startedAt: number;
	command: string;
}

const CLI_COMMANDS: Record<CLIType, string> = {
	claude: "claude",
	codex: "codex",
	gemini: "gemini",
};

const processes = new Map<CLIType, { proc: Subprocess; startedAt: number }>();

export function startCLI(cli: CLIType, args: string[] = []): CLIProcess {
	if (processes.has(cli)) {
		const existing = processes.get(cli)!;
		if (existing.proc.exitCode === null) {
			return {
				cli,
				pid: existing.proc.pid,
				status: "running",
				startedAt: existing.startedAt,
				command: `${CLI_COMMANDS[cli]} ${args.join(" ")}`.trim(),
			};
		}
	}

	const command = CLI_COMMANDS[cli];
	const proc = spawn([command, ...args], {
		stdout: "pipe",
		stderr: "pipe",
		stdin: "pipe",
	});

	const startedAt = Date.now();
	processes.set(cli, { proc, startedAt });

	return {
		cli,
		pid: proc.pid,
		status: "running",
		startedAt,
		command: `${command} ${args.join(" ")}`.trim(),
	};
}

export function stopCLI(cli: CLIType): boolean {
	const entry = processes.get(cli);
	if (!entry) return false;
	entry.proc.kill();
	processes.delete(cli);
	return true;
}

export function getCLIProcess(cli: CLIType): CLIProcess | null {
	const entry = processes.get(cli);
	if (!entry) return null;

	const status = entry.proc.exitCode === null ? "running" : "stopped";
	if (status === "stopped") {
		processes.delete(cli);
		return null;
	}

	return {
		cli,
		pid: entry.proc.pid,
		status,
		startedAt: entry.startedAt,
		command: CLI_COMMANDS[cli],
	};
}

export function listCLIProcesses(): CLIProcess[] {
	const result: CLIProcess[] = [];
	for (const cli of ["claude", "codex", "gemini"] as CLIType[]) {
		const proc = getCLIProcess(cli);
		if (proc) result.push(proc);
	}
	return result;
}

export function stopAll(): void {
	for (const [cli] of processes) {
		stopCLI(cli);
	}
}
