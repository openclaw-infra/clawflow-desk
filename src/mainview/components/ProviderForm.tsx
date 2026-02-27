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

const inputClass = "w-full px-3 py-1.5 rounded bg-[var(--color-input)] text-[var(--color-input-foreground)] text-sm placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]";

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
				className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-3 transition-colors"
			>
				<ArrowLeft className="w-3.5 h-3.5" /> Back
			</button>

			<div className="mb-4">
				<h2 className="text-base font-semibold text-[var(--color-foreground)]">
					{isEditing ? "Edit Provider" : "Add Provider"}
				</h2>
				<p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
					Configure API provider for {cliLabel}
				</p>
			</div>

			{!isEditing && (
				<div className="mb-4">
					<label className="block text-[10px] font-medium text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wider">
						Quick Presets
					</label>
					<div className="flex flex-wrap gap-1.5">
						{PRESETS[snap.activeCLI].map((preset) => (
							<button
								key={preset.name}
								onClick={() => handlePreset(preset)}
								className="px-2.5 py-1 rounded text-xs font-medium bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-channel-hover)] transition-colors"
							>
								{preset.name}
							</button>
						))}
						<button
							onClick={() => { setName(""); setBaseUrl(""); }}
							className="px-2.5 py-1 rounded text-xs font-medium border border-dashed border-[var(--color-muted-foreground)]/30 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)]/30 transition-colors"
						>
							Custom
						</button>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-3">
				<div>
					<label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">Name</label>
					<input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Proxy" className={inputClass} required />
				</div>

				<div>
					<label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">API Key</label>
					<div className="relative">
						<input
							type={showKey ? "text" : "password"}
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
							placeholder={snap.activeCLI === "claude" ? "sk-ant-..." : snap.activeCLI === "codex" ? "sk-..." : "AI..."}
							className={`${inputClass} pr-9 font-mono`}
							required
						/>
						<button
							type="button"
							onClick={() => setShowKey(!showKey)}
							className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
						>
							{showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
						</button>
					</div>
				</div>

				<div>
					<label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">
						Base URL <span className="text-[var(--color-muted-foreground)] font-normal">(optional)</span>
					</label>
					<input type="url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.example.com/v1" className={inputClass} />
				</div>

				<div>
					<label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">
						Model <span className="text-[var(--color-muted-foreground)] font-normal">(optional)</span>
					</label>
					<input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder={snap.activeCLI === "claude" ? "claude-sonnet-4-5" : snap.activeCLI === "codex" ? "gpt-5.3-codex" : "gemini-3-pro"} className={inputClass} />
				</div>

				<div className="flex items-center gap-2 pt-1">
					<button
						type="submit"
						className="px-4 py-1.5 rounded text-xs font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-brand-hover)] transition-colors"
					>
						{isEditing ? "Save Changes" : "Add Provider"}
					</button>
					<button
						type="button"
						onClick={actions.backToList}
						className="px-4 py-1.5 rounded text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
