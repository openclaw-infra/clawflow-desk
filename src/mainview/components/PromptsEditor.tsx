import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { Save, FileText, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function PromptsEditor() {
	const snap = useSnapshot(store);
	const [content, setContent] = useState("");
	const [saved, setSaved] = useState(false);

	useEffect(() => { actions.loadPromptFile(); }, [snap.activeCLI]);
	useEffect(() => { if (snap.promptFile) setContent(snap.promptFile.content); }, [snap.promptFile]);

	const isDirty = content !== (snap.promptFile?.content || "");

	const handleSave = async () => {
		await actions.savePromptFile(content);
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	const cliLabels = { claude: "CLAUDE.md", codex: "AGENTS.md", gemini: "GEMINI.md" };
	const filename = cliLabels[snap.activeCLI] || "";

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between mb-3">
				<div>
					<h2 className="text-base font-semibold text-foreground flex items-center gap-2">
						<FileText className="w-4 h-4 text-muted-foreground" />
						{filename}
					</h2>
					<p className="text-xs text-muted-foreground mt-0.5 font-mono">{snap.promptFile?.path || ""}</p>
				</div>
				<div className="flex items-center gap-2">
					{saved && <Badge variant="success">Saved!</Badge>}
					{isDirty && (
						<Button variant="ghost" size="sm" onClick={() => setContent(snap.promptFile?.content || "")}>
							<RotateCcw className="w-3 h-3" /> Reset
						</Button>
					)}
					<Button onClick={handleSave} disabled={!isDirty}>
						<Save className="w-3.5 h-3.5" /> Save
					</Button>
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
				className="flex-1 w-full px-3 py-2.5 rounded-lg bg-input text-[var(--color-input-foreground)] font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[400px] placeholder:text-muted-foreground"
				spellCheck={false}
			/>

			<div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
				<span>{content.length} characters</span>
				<span>{content.split("\n").length} lines</span>
			</div>
		</div>
	);
}
