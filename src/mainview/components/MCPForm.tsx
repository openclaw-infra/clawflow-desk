import { useState, useEffect } from "react";
import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { ArrowLeft, Plus, X } from "lucide-react";

const inputClass = "w-full px-3 py-1.5 rounded bg-[var(--color-input)] text-[var(--color-input-foreground)] text-sm placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]";

export function MCPForm() {
	const snap = useSnapshot(store);
	const editing = snap.editingMCP;

	const [name, setName] = useState("");
	const [command, setCommand] = useState("");
	const [args, setArgs] = useState("");
	const [envPairs, setEnvPairs] = useState<{ key: string; value: string }[]>([]);

	useEffect(() => {
		if (editing) {
			setName(editing.name);
			setCommand(editing.command);
			setArgs(editing.args?.join(" ") || "");
			setEnvPairs(
				editing.env
					? Object.entries(editing.env).map(([key, value]) => ({ key, value }))
					: []
			);
		} else {
			setName(""); setCommand(""); setArgs(""); setEnvPairs([]);
		}
	}, [editing]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !command.trim()) return;
		const env: Record<string, string> = {};
		for (const pair of envPairs) {
			if (pair.key.trim()) env[pair.key.trim()] = pair.value;
		}
		actions.saveMCPServer({
			name: name.trim(),
			command: command.trim(),
			args: args.trim() ? args.trim().split(/\s+/) : undefined,
			env: Object.keys(env).length > 0 ? env : undefined,
		});
	};

	const addEnvPair = () => setEnvPairs([...envPairs, { key: "", value: "" }]);
	const removeEnvPair = (idx: number) => setEnvPairs(envPairs.filter((_, i) => i !== idx));
	const updateEnvPair = (idx: number, field: "key" | "value", val: string) => {
		const updated = [...envPairs];
		updated[idx] = { ...updated[idx], [field]: val };
		setEnvPairs(updated);
	};

	return (
		<div className="max-w-lg">
			<button
				onClick={() => actions.backToList()}
				className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-3 transition-colors"
			>
				<ArrowLeft className="w-3.5 h-3.5" /> Back
			</button>

			<h2 className="text-base font-semibold text-[var(--color-foreground)] mb-4">
				{editing ? "Edit MCP Server" : "Add MCP Server"}
			</h2>

			<form onSubmit={handleSubmit} className="space-y-3">
				<div>
					<label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">Server Name</label>
					<input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. filesystem" disabled={!!editing} className={`${inputClass} disabled:opacity-40`} required />
				</div>

				<div>
					<label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">Command</label>
					<input type="text" value={command} onChange={(e) => setCommand(e.target.value)} placeholder="e.g. npx or /usr/local/bin/mcp-server" className={inputClass} required />
				</div>

				<div>
					<label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">Arguments</label>
					<input type="text" value={args} onChange={(e) => setArgs(e.target.value)} placeholder="e.g. -y @modelcontextprotocol/server-filesystem /tmp" className={inputClass} />
					<p className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">Space-separated arguments</p>
				</div>

				<div>
					<div className="flex items-center justify-between mb-1.5">
						<label className="text-xs font-medium text-[var(--color-foreground)]">Environment Variables</label>
						<button type="button" onClick={addEnvPair} className="flex items-center gap-0.5 text-[10px] text-[var(--color-primary)] hover:text-[var(--color-brand-hover)]">
							<Plus className="w-3 h-3" /> Add
						</button>
					</div>
					{envPairs.length === 0 ? (
						<p className="text-[10px] text-[var(--color-muted-foreground)]">No environment variables</p>
					) : (
						<div className="space-y-1.5">
							{envPairs.map((pair, idx) => (
								<div key={idx} className="flex items-center gap-1.5">
									<input type="text" value={pair.key} onChange={(e) => updateEnvPair(idx, "key", e.target.value)} placeholder="KEY" className={`flex-1 ${inputClass} font-mono`} />
									<span className="text-[var(--color-muted-foreground)] text-xs">=</span>
									<input type="text" value={pair.value} onChange={(e) => updateEnvPair(idx, "value", e.target.value)} placeholder="value" className={`flex-1 ${inputClass} font-mono`} />
									<button type="button" onClick={() => removeEnvPair(idx)} className="p-1 rounded hover:bg-[var(--color-destructive)]/10 transition-colors">
										<X className="w-3.5 h-3.5 text-[var(--color-destructive)]" />
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="flex items-center gap-2 pt-1">
					<button type="submit" className="px-4 py-1.5 rounded text-xs font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-brand-hover)] transition-colors">
						{editing ? "Update" : "Add"} Server
					</button>
					<button type="button" onClick={() => actions.backToList()} className="px-4 py-1.5 rounded text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors">
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
