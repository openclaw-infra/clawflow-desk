import { useState } from "react";
import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
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
			<button
				onClick={actions.backToList}
				className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
			>
				<ArrowLeft className="w-4 h-4" /> Back
			</button>

			<div className="mb-6">
				<h2 className="text-xl font-semibold">
					{isEditing ? "Edit Provider" : "Add Provider"}
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Configure API provider for {cliLabel}
				</p>
			</div>

			{!isEditing && (
				<div className="mb-6">
					<label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
						Quick Presets
					</label>
					<div className="flex flex-wrap gap-2">
						{PRESETS[snap.activeCLI].map((preset) => (
							<button
								key={preset.name}
								onClick={() => handlePreset(preset)}
								className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-secondary transition-colors"
							>
								{preset.name}
							</button>
						))}
						<button
							onClick={() => { setName(""); setBaseUrl(""); }}
							className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-border hover:bg-secondary transition-colors text-muted-foreground"
						>
							Custom
						</button>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium mb-1.5">Name</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g. My Proxy"
						className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
						required
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1.5">API Key</label>
					<div className="relative">
						<input
							type={showKey ? "text" : "password"}
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
							placeholder={snap.activeCLI === "claude" ? "sk-ant-..." : snap.activeCLI === "codex" ? "sk-..." : "AI..."}
							className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
							required
						/>
						<button
							type="button"
							onClick={() => setShowKey(!showKey)}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						>
							{showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
						</button>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1.5">
						Base URL <span className="text-muted-foreground font-normal">(optional)</span>
					</label>
					<input
						type="url"
						value={baseUrl}
						onChange={(e) => setBaseUrl(e.target.value)}
						placeholder="https://api.example.com/v1"
						className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1.5">
						Model <span className="text-muted-foreground font-normal">(optional)</span>
					</label>
					<input
						type="text"
						value={model}
						onChange={(e) => setModel(e.target.value)}
						placeholder={snap.activeCLI === "claude" ? "claude-sonnet-4-5" : snap.activeCLI === "codex" ? "gpt-5.3-codex" : "gemini-3-pro"}
						className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
					/>
				</div>

				<div className="flex items-center gap-3 pt-2">
					<button
						type="submit"
						className="px-5 py-2.5 rounded-lg text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
					>
						{isEditing ? "Save Changes" : "Add Provider"}
					</button>
					<button
						type="button"
						onClick={actions.backToList}
						className="px-5 py-2.5 rounded-lg text-sm font-medium bg-secondary hover:bg-muted transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
