import { useState } from "react";
import { api } from "../lib/api";
import { Download, Upload, Check, AlertCircle } from "lucide-react";

export function Settings() {
	const [exportPath, setExportPath] = useState("");
	const [importPath, setImportPath] = useState("");
	const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

	const handleExport = async () => {
		try {
			const path = await api.exportConfig(exportPath || undefined);
			setStatus({ type: "success", msg: `Exported to ${path}` });
			setTimeout(() => setStatus(null), 3000);
		} catch (e: any) {
			setStatus({ type: "error", msg: e.message || "Export failed" });
		}
	};

	const handleImport = async () => {
		if (!importPath.trim()) {
			setStatus({ type: "error", msg: "Please enter a file path" });
			return;
		}
		try {
			const data = await api.importConfig(importPath.trim());
			setStatus({
				type: "success",
				msg: `Imported ${data.providers.length} providers, MCP configs, and prompts`,
			});
			setTimeout(() => setStatus(null), 3000);
		} catch (e: any) {
			setStatus({ type: "error", msg: e.message || "Import failed" });
		}
	};

	return (
		<div>
			<h2 className="text-base font-semibold text-[var(--color-foreground)] mb-4">Settings</h2>

			{status && (
				<div className={`mb-3 px-3 py-2 rounded text-xs flex items-center gap-2 ${
					status.type === "success"
						? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
						: "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]"
				}`}>
					{status.type === "success" ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
					{status.msg}
				</div>
			)}

			<div className="space-y-3 max-w-lg">
				<div className="p-4 rounded-lg bg-[var(--color-card)]">
					<h3 className="text-sm font-medium text-[var(--color-foreground)] flex items-center gap-2 mb-2">
						<Download className="w-4 h-4 text-[var(--color-muted-foreground)]" />
						Export Configuration
					</h3>
					<p className="text-xs text-[var(--color-muted-foreground)] mb-3">
						Export all providers, MCP servers, and prompts to a JSON file.
					</p>
					<div className="flex gap-2">
						<input
							type="text"
							value={exportPath}
							onChange={(e) => setExportPath(e.target.value)}
							placeholder="~/.clawflow-desk/backup.json"
							className="flex-1 px-3 py-1.5 rounded bg-[var(--color-input)] text-[var(--color-input-foreground)] text-xs font-mono placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
						/>
						<button
							onClick={handleExport}
							className="px-3 py-1.5 rounded text-xs font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-brand-hover)] transition-colors"
						>
							Export
						</button>
					</div>
				</div>

				<div className="p-4 rounded-lg bg-[var(--color-card)]">
					<h3 className="text-sm font-medium text-[var(--color-foreground)] flex items-center gap-2 mb-2">
						<Upload className="w-4 h-4 text-[var(--color-muted-foreground)]" />
						Import Configuration
					</h3>
					<p className="text-xs text-[var(--color-muted-foreground)] mb-3">
						Import providers, MCP servers, and prompts from a backup file.
					</p>
					<div className="flex gap-2">
						<input
							type="text"
							value={importPath}
							onChange={(e) => setImportPath(e.target.value)}
							placeholder="/path/to/backup.json"
							className="flex-1 px-3 py-1.5 rounded bg-[var(--color-input)] text-[var(--color-input-foreground)] text-xs font-mono placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
						/>
						<button
							onClick={handleImport}
							className="px-3 py-1.5 rounded text-xs font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-brand-hover)] transition-colors"
						>
							Import
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
