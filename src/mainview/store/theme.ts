import { proxy } from "valtio";
import { api } from "../lib/api";

type Theme = "light" | "dark" | "system";

interface ThemeState {
	theme: Theme;
	resolved: "light" | "dark";
}

export const themeStore = proxy<ThemeState>({
	theme: "dark",
	resolved: "dark",
});

function getSystemTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: "light" | "dark") {
	themeStore.resolved = resolved;
	if (resolved === "dark") {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}
}

function resolve(theme: Theme): "light" | "dark" {
	return theme === "system" ? getSystemTheme() : theme;
}

export function setTheme(theme: Theme) {
	themeStore.theme = theme;
	applyTheme(resolve(theme));
	// Persist to SQLite via RPC (fire-and-forget)
	api.setSetting("theme", theme).catch(() => {});
	// Also save to localStorage as fallback for browser preview
	try { localStorage.setItem("clawflow-theme", theme); } catch {}
}

export async function initTheme() {
	let saved: Theme = "dark";

	// Try SQLite first (Electrobun), then localStorage fallback (browser)
	try {
		const dbTheme = await api.getSetting("theme");
		if (dbTheme === "light" || dbTheme === "dark" || dbTheme === "system") {
			saved = dbTheme;
		} else {
			// Fallback to localStorage
			const lsTheme = localStorage.getItem("clawflow-theme") as Theme | null;
			if (lsTheme === "light" || lsTheme === "dark" || lsTheme === "system") saved = lsTheme;
		}
	} catch {
		try {
			const lsTheme = localStorage.getItem("clawflow-theme") as Theme | null;
			if (lsTheme === "light" || lsTheme === "dark" || lsTheme === "system") saved = lsTheme;
		} catch {}
	}

	themeStore.theme = saved;
	applyTheme(resolve(saved));

	// Listen for system theme changes
	if (typeof window !== "undefined") {
		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
			if (themeStore.theme === "system") {
				applyTheme(getSystemTheme());
			}
		});
	}
}
