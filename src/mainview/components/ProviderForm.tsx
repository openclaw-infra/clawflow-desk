import { useState } from "react";
import type { Provider, CLIType } from "../types";

const PRESETS: Record<CLIType, { name: string; baseUrl?: string }[]> = {
	claude: [
		{ name: "Official (Anthropic)" },
		{ name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1" },
	],
	codex: [
		{ name: "Official (OpenAI)" },
		{ name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1" },
	],
	gemini: [
		{ name: "Official (Google)" },
	],
};

interface ProviderFormProps {
	cli: CLIType;
	provider: Provider | null;
	onSave: () => void;
	onCancel: () => void;
}

export function ProviderForm({ cli, provider, onSave, onCancel }: ProviderFormProps) {
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

		// TODO: IPC call to save provider
		const data = {
			id: provider?.id || crypto.randomUUID(),
			name: name.trim(),
			cli,
			apiKey: apiKey.trim(),
			baseUrl: baseUrl.trim() || undefined,
			model: model.trim() || undefined,
			isActive: provider?.isActive || false,
		};
		console.log("Save provider:", data);
		onSave();
	};

	return (
		<div className="max-w-lg">
			<div className="mb-6">
				<h2 className="text-xl font-semibold">
					{isEditing ? "Edit Provider" : "Add Provider"}
				</h2>
				<p className="text-sm text-[var(--muted-foreground)] mt-1">
					Configure API provider for {cli === "claude" ? "Claude Code" : cli === "codex" ? "Codex" : "Gemini CLI"}
				</p>
			</div>

			{/* Presets */}
			{!isEditing && (
				<div className="mb-6">
					<label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">
						Quick Presets
					</label>
					<div className="flex flex-wrap gap-2">
						{PRESETS[cli].map((preset) => (
							<button
								key={preset.name}
								onClick={() => handlePreset(preset)}
								className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
							>
								{preset.name}
							</button>
						))}
						<button
							onClick={() => { setName(""); setBaseUrl(""); }}
							className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-[var(--border)] hover:bg-[var(--secondary)] transition-colors text-[var(--muted-foreground)]"
						>
							Custom
						</button>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Name */}
				<div>
					<label className="block text-sm font-medium mb-1.5">Name</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g. My Proxy"
						className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
						required
					/>
				</div>

				{/* API Key */}
				<div>
					<label className="block text-sm font-medium mb-1.5">API Key</label>
					<div className="relative">
						<input
							type={showKey ? "text" : "password"}
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
							placeholder={cli === "claude" ? "sk-ant-..." : cli === "codex" ? "sk-..." : "AI..."}
							className="w-full px-3 py-2 pr-16 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
							required
						/>
						<button
							type="button"
							onClick={() => setShowKey(!showKey)}
							className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
						>
							{showKey ? "Hide" : "Show"}
						</button>
					</div>
				</div>

				{/* Base URL */}
				<div>
					<label className="block text-sm font-medium mb-1.5">
						Base URL <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
					</label>
					<input
						type="url"
						value={baseUrl}
						onChange={(e) => setBaseUrl(e.target.value)}
						placeholder="https://api.example.com/v1"
						className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
					/>
				</div>

				{/* Model */}
				<div>
					<label className="block text-sm font-medium mb-1.5">
						Model <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
					</label>
					<input
						type="text"
						value={model}
						onChange={(e) => setModel(e.target.value)}
						placeholder={cli === "claude" ? "claude-sonnet-4-5" : cli === "codex" ? "gpt-5.3-codex" : "gemini-3-pro"}
						className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
					/>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-3 pt-2">
					<button
						type="submit"
						className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
					>
						{isEditing ? "Save Changes" : "Add Provider"}
					</button>
					<button
						type="button"
						onClick={onCancel}
						className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--secondary)] hover:bg-[var(--muted)] transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
