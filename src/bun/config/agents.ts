import { Database } from "bun:sqlite";
import type { AgentInstance, Provider, CLIType } from "../../shared/types";

let db: Database;

export function initAgentDB(dbPath: string) {
	db = new Database(dbPath);
	db.run(`CREATE TABLE IF NOT EXISTS agents (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		cli TEXT NOT NULL,
		providerId TEXT NOT NULL,
		workDir TEXT,
		icon TEXT,
		color TEXT,
		createdAt INTEGER NOT NULL,
		sortOrder INTEGER NOT NULL DEFAULT 0
	)`);
}

export function getAgents(): AgentInstance[] {
	return db.query("SELECT * FROM agents ORDER BY sortOrder ASC, createdAt ASC").all() as AgentInstance[];
}

export function saveAgent(agent: AgentInstance): AgentInstance {
	const existing = db.query("SELECT id FROM agents WHERE id = ?").get(agent.id);
	if (existing) {
		db.run(
			"UPDATE agents SET name=?, cli=?, providerId=?, workDir=?, icon=?, color=?, sortOrder=? WHERE id=?",
			[agent.name, agent.cli, agent.providerId, agent.workDir ?? null, agent.icon ?? null, agent.color ?? null, agent.sortOrder, agent.id]
		);
	} else {
		db.run(
			"INSERT INTO agents (id, name, cli, providerId, workDir, icon, color, createdAt, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[agent.id, agent.name, agent.cli, agent.providerId, agent.workDir ?? null, agent.icon ?? null, agent.color ?? null, agent.createdAt, agent.sortOrder]
		);
	}
	return agent;
}

export function deleteAgent(agentId: string): void {
	db.run("DELETE FROM agents WHERE id = ?", [agentId]);
}

export function reorderAgents(agentIds: string[]): void {
	const stmt = db.prepare("UPDATE agents SET sortOrder = ? WHERE id = ?");
	const tx = db.transaction(() => {
		agentIds.forEach((id, i) => stmt.run(i, id));
	});
	tx();
}

// Build env vars for an agent instance based on its provider
export function buildAgentEnv(agent: AgentInstance, provider: Provider): Record<string, string> {
	const env: Record<string, string> = { TERM: "xterm-256color" };

	switch (agent.cli) {
		case "claude":
			env.ANTHROPIC_API_KEY = provider.apiKey;
			if (provider.baseUrl) env.ANTHROPIC_BASE_URL = provider.baseUrl;
			if (provider.model) env.ANTHROPIC_MODEL = provider.model;
			break;
		case "codex":
			env.OPENAI_API_KEY = provider.apiKey;
			if (provider.baseUrl) env.OPENAI_BASE_URL = provider.baseUrl;
			break;
		case "gemini":
			env.GEMINI_API_KEY = provider.apiKey;
			if (provider.baseUrl) env.GEMINI_BASE_URL = provider.baseUrl;
			break;
	}

	return env;
}

// Create default agents for installed CLIs
export function createDefaultAgents(providers: Provider[]): AgentInstance[] {
	const existing = getAgents();
	if (existing.length > 0) return existing;

	const defaults: { cli: CLIType; name: string; icon: string; color: string }[] = [
		{ cli: "claude", name: "Claude Code", icon: "🤖", color: "#d97757" },
		{ cli: "codex", name: "Codex", icon: "⚡", color: "#10a37f" },
		{ cli: "gemini", name: "Gemini CLI", icon: "✨", color: "#4285f4" },
	];

	const agents: AgentInstance[] = [];
	for (const def of defaults) {
		const provider = providers.find(p => p.cli === def.cli && p.isActive) ?? providers.find(p => p.cli === def.cli);
		if (!provider) continue;
		const agent: AgentInstance = {
			id: `agent-${def.cli}-${Date.now()}`,
			name: def.name,
			cli: def.cli,
			providerId: provider.id,
			icon: def.icon,
			color: def.color,
			createdAt: Date.now(),
			sortOrder: agents.length,
		};
		saveAgent(agent);
		agents.push(agent);
	}
	return agents;
}
