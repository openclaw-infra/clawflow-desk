import { useSnapshot } from "valtio";
import { store } from "../store";

export function StatusBar() {
	const snap = useSnapshot(store);
	const cliLabels = { claude: "Claude Code", codex: "Codex", gemini: "Gemini CLI" };

	return (
		<div className="flex items-center justify-between px-3 py-1 bg-[var(--color-primary)] text-white text-[10px]">
			<div className="flex items-center gap-3">
				<span className="font-medium">ClawFlow Desk</span>
				<span className="opacity-70">{cliLabels[snap.activeCLI]}</span>
			</div>
			<div className="flex items-center gap-3 opacity-70">
				<span>{snap.providers.length} providers</span>
				<span>{snap.agents.length} agents</span>
			</div>
		</div>
	);
}
