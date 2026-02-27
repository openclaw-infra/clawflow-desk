import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { Save, FileText, RotateCcw } from "lucide-react";

export function PromptsEditor() {
	const snap = useSnapshot(store);
	const [content, setContent] = useState("");
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		actions.loadPromptFile();
	}, [snap.activeCLI]);

	useEffect(() => {
		if (snap.promptFile) {
			setContent(snap.promptFile.content);
		}
	}, [snap.promptFile]);

	const isDirty = content !== (snap.promptFile?.content || "");

	const handleSave = async () => {
		await actions.savePromptFile(content);
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	const handleReset = () => {
		setContent(snap.promptFile?.content || "");
	};

	const cliLabels = { claude: "CLAUDE.md", codex: "AGENTS.md", gemini: "GEMINI.md" };
	const filename = cliLabels[snap.activeCLI] || "";

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between mb-3">
				<div>
					<h2 className="text-base font-semibold text-[var(--color-foreground)] flex items-center gap-2">
						<FileText className="w-4 h-4 text-[var(--color-muted-foreground)]" />
						{filename}
					</h2>
					<p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 font-mono">
						{snap.promptFile?.path || ""}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{saved && (
						<span className="text-xs text-[var(--color-success)]">Saved!</span>
					)}
					{isDirty && (
						<button
							onClick={handleReset}
							className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors"
						>
							<RotateCcw className="w-3 h-3" /> Reset
						</button>
					)}
					<button
						onClick={handleSave}
						disabled={!isDirty}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-40"
					>
						<Save className="w-3.5 h-3.5" /> Save
					</button>
				</div>
			</div>

			{!snap.promptFile?.exists && (
				<div className="mb-2 px-3 py-2 rounded bg-[var(--color-discord-yellow)]/10 text-xs text-[var(--color-discord-yellow)]">
					File does not exist yet. It will be created when you save.
				</div>
			)}

			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder={`# ${filename}\n\nWrite your system prompt here...`}
				className="flex-1 w-full px-3 py-2.5 rounded-lg bg-[var(--color-input)] text-[var(--color-input-foreground)] font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] min-h-[400px] placeholder:text-[var(--color-muted-foreground)]"
				spellCheck={false}
			/>

			<div className="flex items-center justify-between mt-1.5 text-[10px] text-[var(--color-muted-foreground)]">
				<span>{content.length} characters</span>
				<span>{content.split("\n").length} lines</span>
			</div>
		</div>
	);
}
