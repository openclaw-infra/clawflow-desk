import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from "fs";
import type { MCPServer, MCPConfig } from "../../shared/types";

const HOME = homedir();

// MCP config file paths
const MCP_PATHS = {
	claude: join(HOME, ".claude.json"),
	codex: join(HOME, ".codex", "config.toml"),
	gemini: join(HOME, ".gemini", "settings.json"),
};

function atomicWrite(path: string, content: string): void {
	const dir = join(path, "..");
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	const tmp = path + ".tmp";
	writeFileSync(tmp, content);
	renameSync(tmp, path);
}

// === Claude MCP ===
// ~/.claude.json: { "mcpServers": { "name": { "command": "...", "args": [...], "env": {...} } } }

function readClaudeMCP(): MCPServer[] {
	try {
		if (!existsSync(MCP_PATHS.claude)) return [];
		const data = JSON.parse(readFileSync(MCP_PATHS.claude, "utf-8"));
		const servers = data.mcpServers || {};
		return Object.entries(servers).map(([name, cfg]: [string, any]) => ({
			name,
			command: cfg.command || "",
			args: cfg.args,
			env: cfg.env,
			disabled: cfg.disabled,
		}));
	} catch {
		return [];
	}
}

function writeClaudeMCP(servers: MCPServer[]): void {
	let data: any = {};
	try {
		if (existsSync(MCP_PATHS.claude)) {
			data = JSON.parse(readFileSync(MCP_PATHS.claude, "utf-8"));
		}
	} catch {}
	data.mcpServers = {};
	for (const s of servers) {
		const entry: any = { command: s.command };
		if (s.args?.length) entry.args = s.args;
		if (s.env && Object.keys(s.env).length) entry.env = s.env;
		if (s.disabled) entry.disabled = true;
		data.mcpServers[s.name] = entry;
	}
	atomicWrite(MCP_PATHS.claude, JSON.stringify(data, null, 2));
}

// === Codex MCP ===
// ~/.codex/config.toml: [mcp_servers.name] \n command = "..." \n args = [...]

function readCodexMCP(): MCPServer[] {
	try {
		if (!existsSync(MCP_PATHS.codex)) return [];
		const content = readFileSync(MCP_PATHS.codex, "utf-8");
		const servers: MCPServer[] = [];
		const regex = /\[mcp_servers\.([^\]]+)\]\s*\n([\s\S]*?)(?=\n\[|$)/g;
		let match;
		while ((match = regex.exec(content)) !== null) {
			const name = match[1];
			const block = match[2];
			const cmd = block.match(/command\s*=\s*"([^"]*)"/)?.[1] || "";
			const argsMatch = block.match(/args\s*=\s*\[(.*?)\]/s);
			const args = argsMatch
				? argsMatch[1].match(/"([^"]*)"/g)?.map((s) => s.slice(1, -1)) || []
				: undefined;
			// Parse env
			const envMatch = block.match(/\[mcp_servers\.\w+\.env\]\s*\n([\s\S]*?)(?=\n\[|$)/);
			let env: Record<string, string> | undefined;
			if (envMatch) {
				env = {};
				for (const line of envMatch[1].split("\n")) {
					const kv = line.match(/(\w+)\s*=\s*"([^"]*)"/);
					if (kv) env[kv[1]] = kv[2];
				}
			}
			servers.push({ name, command: cmd, args, env });
		}
		return servers;
	} catch {
		return [];
	}
}

function writeCodexMCP(servers: MCPServer[]): void {
	let content = "";
	try {
		if (existsSync(MCP_PATHS.codex)) {
			content = readFileSync(MCP_PATHS.codex, "utf-8");
			// Remove existing mcp_servers sections
			content = content.replace(/\[mcp_servers\.[^\]]+\]\s*\n[\s\S]*?(?=\n\[(?!mcp_servers)|$)/g, "").trim();
		}
	} catch {}

	for (const s of servers) {
		content += `\n\n[mcp_servers.${s.name}]\ncommand = "${s.command}"`;
		if (s.args?.length) {
			content += `\nargs = [${s.args.map((a) => `"${a}"`).join(", ")}]`;
		}
		if (s.env && Object.keys(s.env).length) {
			content += `\n\n[mcp_servers.${s.name}.env]`;
			for (const [k, v] of Object.entries(s.env)) {
				content += `\n${k} = "${v}"`;
			}
		}
	}
	atomicWrite(MCP_PATHS.codex, content.trim() + "\n");
}

// === Gemini MCP ===
// ~/.gemini/settings.json: { "mcpServers": { "name": { "command": "...", "args": [...] } } }

function readGeminiMCP(): MCPServer[] {
	try {
		if (!existsSync(MCP_PATHS.gemini)) return [];
		const data = JSON.parse(readFileSync(MCP_PATHS.gemini, "utf-8"));
		const servers = data.mcpServers || {};
		return Object.entries(servers).map(([name, cfg]: [string, any]) => ({
			name,
			command: cfg.command || "",
			args: cfg.args,
			env: cfg.env,
			disabled: cfg.disabled,
		}));
	} catch {
		return [];
	}
}

function writeGeminiMCP(servers: MCPServer[]): void {
	let data: any = {};
	try {
		if (existsSync(MCP_PATHS.gemini)) {
			data = JSON.parse(readFileSync(MCP_PATHS.gemini, "utf-8"));
		}
	} catch {}
	data.mcpServers = {};
	for (const s of servers) {
		const entry: any = { command: s.command };
		if (s.args?.length) entry.args = s.args;
		if (s.env && Object.keys(s.env).length) entry.env = s.env;
		if (s.disabled) entry.disabled = true;
		data.mcpServers[s.name] = entry;
	}
	atomicWrite(MCP_PATHS.gemini, JSON.stringify(data, null, 2));
}

// === Public API ===

export function getMCPConfig(cli: string): MCPConfig {
	const c = cli as "claude" | "codex" | "gemini";
	const readers = { claude: readClaudeMCP, codex: readCodexMCP, gemini: readGeminiMCP };
	return {
		cli: c,
		servers: readers[c](),
		configPath: MCP_PATHS[c],
	};
}

export function saveMCPServer(cli: string, server: MCPServer): void {
	const c = cli as "claude" | "codex" | "gemini";
	const readers = { claude: readClaudeMCP, codex: readCodexMCP, gemini: readGeminiMCP };
	const writers = { claude: writeClaudeMCP, codex: writeCodexMCP, gemini: writeGeminiMCP };
	const servers = readers[c]();
	const idx = servers.findIndex((s) => s.name === server.name);
	if (idx >= 0) {
		servers[idx] = server;
	} else {
		servers.push(server);
	}
	writers[c](servers);
}

export function deleteMCPServer(cli: string, name: string): void {
	const c = cli as "claude" | "codex" | "gemini";
	const readers = { claude: readClaudeMCP, codex: readCodexMCP, gemini: readGeminiMCP };
	const writers = { claude: writeClaudeMCP, codex: writeCodexMCP, gemini: writeGeminiMCP };
	const servers = readers[c]().filter((s) => s.name !== name);
	writers[c](servers);
}

export function toggleMCPServer(cli: string, name: string, disabled: boolean): void {
	const c = cli as "claude" | "codex" | "gemini";
	const readers = { claude: readClaudeMCP, codex: readCodexMCP, gemini: readGeminiMCP };
	const writers = { claude: writeClaudeMCP, codex: writeCodexMCP, gemini: writeGeminiMCP };
	const servers = readers[c]();
	const server = servers.find((s) => s.name === name);
	if (server) {
		server.disabled = disabled;
		writers[c](servers);
	}
}
