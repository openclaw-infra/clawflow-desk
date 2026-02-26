import { proxy, subscribe } from "valtio";

type Theme = "light" | "dark" | "system";

interface ThemeState {
	theme: Theme;
	resolved: "light" | "dark";
}

export const themeStore = proxy<ThemeState>({
	theme: "system",
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
	try {
		localStorage.setItem("clawflow-theme", theme);
	} catch {}
}

export function initTheme() {
	let saved: Theme = "system";
	try {
		const s = localStorage.getItem("clawflow-theme") as Theme | null;
		if (s === "light" || s === "dark" || s === "system") saved = s;
	} catch {}
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
