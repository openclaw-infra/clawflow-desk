import { useSnapshot } from "valtio";
import { themeStore, setTheme } from "../store/theme";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "../lib/utils";

const themes = [
	{ key: "light" as const, icon: Sun, label: "Light" },
	{ key: "dark" as const, icon: Moon, label: "Dark" },
	{ key: "system" as const, icon: Monitor, label: "System" },
];

export function ThemeToggle() {
	const snap = useSnapshot(themeStore);

	return (
		<div className="flex items-center gap-0.5 p-0.5 rounded bg-[var(--color-input)]">
			{themes.map(({ key, icon: Icon, label }) => (
				<button
					key={key}
					onClick={() => setTheme(key)}
					className={cn(
						"flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors",
						snap.theme === key
							? "bg-[var(--color-accent)] text-[var(--color-foreground)]"
							: "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
					)}
				>
					<Icon className="w-3 h-3" />
					{label}
				</button>
			))}
		</div>
	);
}
