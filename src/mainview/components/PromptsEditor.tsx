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
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-lg font-semibold flex items-center gap-2">
						<FileText className="w-5 h-5" />
						{filename}
					</h2>
					<p className="text-sm text-muted-foreground mt-1 font-mono">
						{snap.promptFile?.path || ""}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{saved && (
						<span className="text-sm text-green-500 animate-in fade-in">Saved!</span>
					)}
					{isDirty && (
						<button
							onClick={handleReset}
							className="flex items-center gap-1 px-3 py-2 rounded-lg border text-sm hover:bg-accent transition-colors"
							title="Discard changes"
						>
							<RotateCcw className="w-4 h-4" />
							Reset
						</button>
					)}
					<button
						onClick={handleSave}
						disabled={!isDirty}
						className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
					>
						<Save className="w-4 h-4" />
						Save
					</button>
				</div>
			</div>

			{!snap.promptFile?.exists && (
				<div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600 dark:text-amber-400">
					File does not exist yet. It will be created when you save.
				</div>
			)}

			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder={`# ${filename}\n\nWrite your system prompt here...`}
				className="flex-1 w-full px-4 py-3 rounded-lg border bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[400px]"
				spellCheck={false}
			/>

			<div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
				<span>{content.length} characters</span>
				<span>{content.split("\n").length} lines</span>
			</div>
		</div>
	);
}
