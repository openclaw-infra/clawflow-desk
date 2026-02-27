import { useState } from "react";
import { api } from "../lib/api";
import { Download, Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";

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
		if (!importPath.trim()) { setStatus({ type: "error", msg: "Please enter a file path" }); return; }
		try {
			const data = await api.importConfig(importPath.trim());
			setStatus({ type: "success", msg: `Imported ${data.providers.length} providers, MCP configs, and prompts` });
			setTimeout(() => setStatus(null), 3000);
		} catch (e: any) {
			setStatus({ type: "error", msg: e.message || "Import failed" });
		}
	};

	return (
		<div>
			<h2 className="text-base font-semibold text-foreground mb-4">Settings</h2>

			{status && (
				<div className={`mb-3 px-3 py-2 rounded text-xs flex items-center gap-2 ${
					status.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
				}`}>
					{status.type === "success" ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
					{status.msg}
				</div>
			)}

			<div className="space-y-3 max-w-lg">
				<Card>
					<CardHeader>
						<CardTitle><Download className="w-4 h-4 text-muted-foreground" /> Export Configuration</CardTitle>
						<CardDescription>Export all providers, MCP servers, and prompts to a JSON file.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex gap-2">
							<Input value={exportPath} onChange={(e) => setExportPath(e.target.value)} placeholder="~/.clawflow-desk/backup.json" className="font-mono" />
							<Button onClick={handleExport}>Export</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle><Upload className="w-4 h-4 text-muted-foreground" /> Import Configuration</CardTitle>
						<CardDescription>Import providers, MCP servers, and prompts from a backup file.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex gap-2">
							<Input value={importPath} onChange={(e) => setImportPath(e.target.value)} placeholder="/path/to/backup.json" className="font-mono" />
							<Button onClick={handleImport}>Import</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
