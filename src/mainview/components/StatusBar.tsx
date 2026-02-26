import { useState, useEffect } from "react";
import type { CLIStatus } from "../types";

export function StatusBar() {
	const [status, setStatus] = useState<CLIStatus>({
		claude: { installed: false, configPath: "~/.claude/settings.json" },
		codex: { installed: false, configPath: "~/.codex/auth.json" },
		gemini: { installed: false, configPath: "~/.gemini/.env" },
	});

	useEffect(() => {
		// TODO: IPC call to get CLI status
		// const data = await rpc.invoke("config:getCLIStatus");
		// setStatus(data);
	}, []);

	const items = [
		{ key: "claude", label: "Claude", icon: "🟠", ...status.claude },
		{ key: "codex", label: "Codex", icon: "🟢", ...status.codex },
		{ key: "gemini", label: "Gemini", icon: "🔵", ...status.gemini },
	];

	return (
		<footer className="flex items-center gap-4 px-4 py-2 border-t border-[var(--border)] bg-[var(--secondary)] text-xs text-[var(--muted-foreground)]">
			{items.map((item) => (
				<div key={item.key} className="flex items-center gap-1.5">
					<span>{item.icon}</span>
					<span>{item.label}</span>
					<span className={`w-1.5 h-1.5 rounded-full ${item.installed ? "bg-[var(--success)]" : "bg-[var(--destructive)]"}`} />
					{item.activeProvider && (
						<span className="text-[var(--foreground)]">{item.activeProvider}</span>
					)}
				</div>
			))}
			<div className="ml-auto">v0.1.0</div>
		</footer>
	);
}
