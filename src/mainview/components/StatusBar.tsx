import { useSnapshot } from "valtio";
import { store } from "../store";
import { CheckCircle2, XCircle } from "lucide-react";

export function StatusBar() {
	const snap = useSnapshot(store);

	const items = [
		{ key: "claude", label: "Claude", ...snap.cliStatus.claude },
		{ key: "codex", label: "Codex", ...snap.cliStatus.codex },
		{ key: "gemini", label: "Gemini", ...snap.cliStatus.gemini },
	];

	return (
		<footer className="flex items-center gap-4 px-4 py-2 border-t border-border bg-secondary text-xs text-muted-foreground">
			{items.map((item) => (
				<div key={item.key} className="flex items-center gap-1.5">
					{item.installed ? (
						<CheckCircle2 className="w-3 h-3 text-success" />
					) : (
						<XCircle className="w-3 h-3 text-destructive" />
					)}
					<span>{item.label}</span>
					{item.activeProvider && (
						<span className="text-foreground font-medium">{item.activeProvider}</span>
					)}
				</div>
			))}
			<div className="ml-auto">v0.1.0</div>
		</footer>
	);
}
