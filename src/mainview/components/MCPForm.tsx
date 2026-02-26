import { useState, useEffect } from "react";
import { useSnapshot } from "valtio";
import { store, actions } from "../store";
import { ArrowLeft, Plus, X } from "lucide-react";

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
			setName("");
			setCommand("");
			setArgs("");
			setEnvPairs([]);
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
		<div>
			<button
				onClick={() => actions.backToList()}
				className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
			>
				<ArrowLeft className="w-4 h-4" />
				Back to MCP Servers
			</button>

			<h2 className="text-lg font-semibold mb-6">
				{editing ? "Edit MCP Server" : "Add MCP Server"}
			</h2>

			<form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
				<div>
					<label className="block text-sm font-medium mb-1">Server Name</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g. filesystem"
						disabled={!!editing}
						className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
						required
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Command</label>
					<input
						type="text"
						value={command}
						onChange={(e) => setCommand(e.target.value)}
						placeholder="e.g. npx or /usr/local/bin/mcp-server"
						className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
						required
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Arguments</label>
					<input
						type="text"
						value={args}
						onChange={(e) => setArgs(e.target.value)}
						placeholder="e.g. -y @modelcontextprotocol/server-filesystem /tmp"
						className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
					<p className="text-xs text-muted-foreground mt-1">Space-separated arguments</p>
				</div>

				<div>
					<div className="flex items-center justify-between mb-2">
						<label className="block text-sm font-medium">Environment Variables</label>
						<button
							type="button"
							onClick={addEnvPair}
							className="flex items-center gap-1 text-xs text-primary hover:underline"
						>
							<Plus className="w-3 h-3" /> Add
						</button>
					</div>
					{envPairs.length === 0 ? (
						<p className="text-xs text-muted-foreground">No environment variables</p>
					) : (
						<div className="space-y-2">
							{envPairs.map((pair, idx) => (
								<div key={idx} className="flex items-center gap-2">
									<input
										type="text"
										value={pair.key}
										onChange={(e) => updateEnvPair(idx, "key", e.target.value)}
										placeholder="KEY"
										className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
									/>
									<span className="text-muted-foreground">=</span>
									<input
										type="text"
										value={pair.value}
										onChange={(e) => updateEnvPair(idx, "value", e.target.value)}
										placeholder="value"
										className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
									/>
									<button
										type="button"
										onClick={() => removeEnvPair(idx)}
										className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
									>
										<X className="w-4 h-4 text-destructive" />
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="flex gap-3 pt-2">
					<button
						type="submit"
						className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
					>
						{editing ? "Update" : "Add"} Server
					</button>
					<button
						type="button"
						onClick={() => actions.backToList()}
						className="px-4 py-2 rounded-lg border text-sm hover:bg-accent transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
