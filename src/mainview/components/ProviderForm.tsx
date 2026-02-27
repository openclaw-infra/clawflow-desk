import { useState } from "react";
import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { CLIType } from "../types";

const PRESETS: Record<CLIType, { name: string; baseUrl?: string }[]> = {
	claude: [
		{ name: "Official (Anthropic)" },
		{ name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1" },
	],
	codex: [
		{ name: "Official (OpenAI)" },
		{ name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1" },
	],
	gemini: [{ name: "Official (Google)" }],
};

export function ProviderForm() {
	const snap = useSnapshot(store);
	const provider = snap.editingProvider;
	const isEditing = !!provider;

	const [name, setName] = useState(provider?.name || "");
	const [apiKey, setApiKey] = useState(provider?.apiKey || "");
	const [baseUrl, setBaseUrl] = useState(provider?.baseUrl || "");
	const [model, setModel] = useState(provider?.model || "");
	const [showKey, setShowKey] = useState(false);

	const handlePreset = (preset: { name: string; baseUrl?: string }) => {
		setName(preset.name);
		setBaseUrl(preset.baseUrl || "");
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !apiKey.trim()) return;
		actions.saveProvider({
			id: provider?.id || crypto.randomUUID(),
			name: name.trim(),
			cli: snap.activeCLI,
			apiKey: apiKey.trim(),
			baseUrl: baseUrl.trim() || undefined,
			model: model.trim() || undefined,
			isActive: provider?.isActive || false,
		});
	};

	const cliLabel = snap.activeCLI === "claude" ? "Claude Code" : snap.activeCLI === "codex" ? "Codex" : "Gemini CLI";

	return (
		<div className="max-w-lg">
			<Button variant="ghost" size="sm" onClick={actions.backToList} className="mb-3">
				<ArrowLeft className="w-3.5 h-3.5" /> Back
			</Button>

			<div className="mb-4">
				<h2 className="text-base font-semibold text-foreground">
					{isEditing ? "Edit Provider" : "Add Provider"}
				</h2>
				<p className="text-xs text-muted-foreground mt-0.5">
					Configure API provider for {cliLabel}
				</p>
			</div>

			{!isEditing && (
				<div className="mb-4">
					<label className="block text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
						Quick Presets
					</label>
					<div className="flex flex-wrap gap-1.5">
						{PRESETS[snap.activeCLI].map((preset) => (
							<Button key={preset.name} variant="secondary" size="sm" onClick={() => handlePreset(preset)}>
								{preset.name}
							</Button>
						))}
						<Button variant="outline" size="sm" onClick={() => { setName(""); setBaseUrl(""); }}>
							Custom
						</Button>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-3">
				<div>
					<label className="block text-xs font-medium text-foreground mb-1">Name</label>
					<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Proxy" required />
				</div>

				<div>
					<label className="block text-xs font-medium text-foreground mb-1">API Key</label>
					<div className="relative">
						<Input
							type={showKey ? "text" : "password"}
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
							placeholder={snap.activeCLI === "claude" ? "sk-ant-..." : snap.activeCLI === "codex" ? "sk-..." : "AI..."}
							className="pr-9 font-mono"
							required
						/>
						<button
							type="button"
							onClick={() => setShowKey(!showKey)}
							className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						>
							{showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
						</button>
					</div>
				</div>

				<div>
					<label className="block text-xs font-medium text-foreground mb-1">
						Base URL <span className="text-muted-foreground font-normal">(optional)</span>
					</label>
					<Input type="url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.example.com/v1" />
				</div>

				<div>
					<label className="block text-xs font-medium text-foreground mb-1">
						Model <span className="text-muted-foreground font-normal">(optional)</span>
					</label>
					<Input value={model} onChange={(e) => setModel(e.target.value)} placeholder={snap.activeCLI === "claude" ? "claude-sonnet-4-5" : snap.activeCLI === "codex" ? "gpt-5.3-codex" : "gemini-3-pro"} />
				</div>

				<div className="flex items-center gap-2 pt-1">
					<Button type="submit">{isEditing ? "Save Changes" : "Add Provider"}</Button>
					<Button type="button" variant="ghost" onClick={actions.backToList}>Cancel</Button>
				</div>
			</form>
		</div>
	);
}
