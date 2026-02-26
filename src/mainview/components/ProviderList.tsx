import { useState, useEffect } from "react";
import type { Provider, CLIType } from "../types";

interface ProviderListProps {
	cli: CLIType;
	onEdit: (provider: Provider) => void;
	onAdd: () => void;
}

// Mock data for development — will be replaced with IPC calls
const MOCK_PROVIDERS: Provider[] = [
	{ id: "1", name: "Official", cli: "claude", apiKey: "sk-ant-***", isActive: true, createdAt: Date.now() },
	{ id: "2", name: "Proxy A", cli: "claude", apiKey: "sk-***", baseUrl: "https://proxy.example.com", isActive: false, createdAt: Date.now() - 1000 },
];

const CLI_LABELS: Record<CLIType, string> = {
	claude: "Claude Code",
	codex: "Codex",
	gemini: "Gemini CLI",
};

export function ProviderList({ cli, onEdit, onAdd }: ProviderListProps) {
	const [providers, setProviders] = useState<Provider[]>([]);

	useEffect(() => {
		// TODO: Replace with IPC call
		// const data = await rpc.invoke("config:getProviders");
		setProviders(MOCK_PROVIDERS.filter((p) => p.cli === cli));
	}, [cli]);

	const handleActivate = (provider: Provider) => {
		// TODO: IPC call to activate
		setProviders((prev) =>
			prev.map((p) => ({ ...p, isActive: p.id === provider.id }))
		);
	};

	const handleDelete = (provider: Provider) => {
		if (!confirm(`Delete provider "${provider.name}"?`)) return;
		// TODO: IPC call to delete
		setProviders((prev) => prev.filter((p) => p.id !== provider.id));
	};

	return (
		<div>
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-xl font-semibold">{CLI_LABELS[cli]} Providers</h2>
					<p className="text-sm text-[var(--muted-foreground)] mt-1">
						Manage API providers for {CLI_LABELS[cli]}
					</p>
				</div>
				<button
					onClick={onAdd}
					className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
				>
					<span>+</span> Add
				</button>
			</div>

			{/* Provider Cards */}
			{providers.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<div className="text-4xl mb-4">📭</div>
					<p className="text-[var(--muted-foreground)] mb-4">No providers configured for {CLI_LABELS[cli]}</p>
					<button
						onClick={onAdd}
						className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
					>
						Add your first provider
					</button>
				</div>
			) : (
				<div className="space-y-3">
					{providers.map((provider) => (
						<div
							key={provider.id}
							className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
								provider.isActive
									? "border-[var(--success)] bg-[var(--success)]/5"
									: "border-[var(--border)] hover:border-[var(--muted-foreground)]/30"
							}`}
						>
							{/* Status indicator */}
							<div
								className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
									provider.isActive ? "bg-[var(--success)]" : "bg-[var(--muted-foreground)]/30"
								}`}
							/>

							{/* Info */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<span className="font-medium text-sm">{provider.name}</span>
									{provider.isActive && (
										<span className="text-xs px-1.5 py-0.5 rounded bg-[var(--success)]/10 text-[var(--success)] font-medium">
											Active
										</span>
									)}
								</div>
								<div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted-foreground)]">
									<span>Key: {provider.apiKey.slice(0, 8)}***</span>
									{provider.baseUrl && <span>URL: {provider.baseUrl}</span>}
									{provider.model && <span>Model: {provider.model}</span>}
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
								{!provider.isActive && (
									<button
										onClick={() => handleActivate(provider)}
										className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
									>
										Activate
									</button>
								)}
								<button
									onClick={() => onEdit(provider)}
									className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--secondary)] hover:bg-[var(--muted)] transition-colors"
								>
									Edit
								</button>
								<button
									onClick={() => handleDelete(provider)}
									className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--destructive)] bg-[var(--destructive)]/10 hover:bg-[var(--destructive)]/20 transition-colors"
								>
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
