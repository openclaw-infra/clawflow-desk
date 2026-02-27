import { useState, useEffect } from "react";
import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
			setEnvPairs(editing.env ? Object.entries(editing.env).map(([key, value]) => ({ key, value })) : []);
		} else {
			setName(""); setCommand(""); setArgs(""); setEnvPairs([]);
		}
	}, [editing]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !command.trim()) return;
		const env: Record<string, string> = {};
		for (const pair of envPairs) { if (pair.key.trim()) env[pair.key.trim()] = pair.value; }
		actions.saveMCPServer({
			name: name.trim(), command: command.trim(),
			args: args.trim() ? args.trim().split(/\s+/) : undefined,
			env: Object.keys(env).length > 0 ? env : undefined,
		});
	};

	const addEnvPair = () => setEnvPairs([...envPairs, { key: "", value: "" }]);
	const removeEnvPair = (idx: number) => setEnvPairs(envPairs.filter((_, i) => i !== idx));
	const updateEnvPair = (idx: number, field: "key" | "value", val: string) => {
		const updated = [...envPairs]; updated[idx] = { ...updated[idx], [field]: val }; setEnvPairs(updated);
	};

	return (
		<div className="max-w-lg">
			<Button variant="ghost" size="sm" onClick={() => actions.backToList()} className="mb-3">
				<ArrowLeft className="w-3.5 h-3.5" /> Back
			</Button>

			<h2 className="text-base font-semibold text-foreground mb-4">
				{editing ? "Edit MCP Server" : "Add MCP Server"}
			</h2>

			<form onSubmit={handleSubmit} className="space-y-3">
				<div>
					<label className="block text-xs font-medium text-foreground mb-1">Server Name</label>
					<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. filesystem" disabled={!!editing} required />
				</div>
				<div>
					<label className="block text-xs font-medium text-foreground mb-1">Command</label>
					<Input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="e.g. npx or /usr/local/bin/mcp-server" required />
				</div>
				<div>
					<label className="block text-xs font-medium text-foreground mb-1">Arguments</label>
					<Input value={args} onChange={(e) => setArgs(e.target.value)} placeholder="e.g. -y @modelcontextprotocol/server-filesystem /tmp" />
					<p className="text-[10px] text-muted-foreground mt-0.5">Space-separated arguments</p>
				</div>
				<div>
					<div className="flex items-center justify-between mb-1.5">
						<label className="text-xs font-medium text-foreground">Environment Variables</label>
						<Button type="button" variant="link" size="sm" onClick={addEnvPair} className="text-[10px] p-0 h-auto">
							<Plus className="w-3 h-3" /> Add
						</Button>
					</div>
					{envPairs.length === 0 ? (
						<p className="text-[10px] text-muted-foreground">No environment variables</p>
					) : (
						<div className="space-y-1.5">
							{envPairs.map((pair, idx) => (
								<div key={idx} className="flex items-center gap-1.5">
									<Input value={pair.key} onChange={(e) => updateEnvPair(idx, "key", e.target.value)} placeholder="KEY" className="flex-1 font-mono" />
									<span className="text-muted-foreground text-xs">=</span>
									<Input value={pair.value} onChange={(e) => updateEnvPair(idx, "value", e.target.value)} placeholder="value" className="flex-1 font-mono" />
									<Button type="button" variant="ghost" size="icon-sm" className="hover:text-destructive hover:bg-destructive/10" onClick={() => removeEnvPair(idx)}>
										<X className="w-3.5 h-3.5" />
									</Button>
								</div>
							))}
						</div>
					)}
				</div>
				<div className="flex items-center gap-2 pt-1">
					<Button type="submit">{editing ? "Update" : "Add"} Server</Button>
					<Button type="button" variant="ghost" onClick={() => actions.backToList()}>Cancel</Button>
				</div>
			</form>
		</div>
	);
}
