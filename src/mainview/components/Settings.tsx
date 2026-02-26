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
			<h2 className="text-lg font-semibold mb-6">Settings</h2>

			{status && (
				<div className={`mb-4 px-3 py-2 rounded-lg border text-sm flex items-center gap-2 ${
					status.type === "success"
						? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
						: "bg-destructive/10 border-destructive/20 text-destructive"
				}`}>
					{status.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
					{status.msg}
				</div>
			)}

			<div className="space-y-6 max-w-lg">
				<div className="p-4 rounded-lg border bg-card">
					<h3 className="font-medium flex items-center gap-2 mb-3">
						<Download className="w-4 h-4" />
						Export Configuration
					</h3>
					<p className="text-sm text-muted-foreground mb-3">
						Export all providers, MCP servers, and prompts to a JSON file.
					</p>
					<div className="flex gap-2">
						<input
							type="text"
							value={exportPath}
							onChange={(e) => setExportPath(e.target.value)}
							placeholder="~/.clawflow-desk/backup.json (default)"
							className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
						/>
						<button
							onClick={handleExport}
							className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
						>
							Export
						</button>
					</div>
				</div>

				<div className="p-4 rounded-lg border bg-card">
					<h3 className="font-medium flex items-center gap-2 mb-3">
						<Upload className="w-4 h-4" />
						Import Configuration
					</h3>
					<p className="text-sm text-muted-foreground mb-3">
						Import providers, MCP servers, and prompts from a backup file.
					</p>
					<div className="flex gap-2">
						<input
							type="text"
							value={importPath}
							onChange={(e) => setImportPath(e.target.value)}
							placeholder="/path/to/backup.json"
							className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
						/>
						<button
							onClick={handleImport}
							className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
						>
							Import
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
