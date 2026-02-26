import { useSnapshot } from "valtio";
import { themeStore, setTheme } from "../store/theme";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "../lib/utils";

const options = [
	{ value: "light" as const, icon: Sun, label: "Light" },
	{ value: "dark" as const, icon: Moon, label: "Dark" },
	{ value: "system" as const, icon: Monitor, label: "System" },
];

export function ThemeToggle() {
	const snap = useSnapshot(themeStore);

	return (
		<div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
			{options.map((opt) => {
				const Icon = opt.icon;
				return (
					<button
						key={opt.value}
						onClick={() => setTheme(opt.value)}
						className={cn(
							"flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
							snap.theme === opt.value
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						)}
						title={opt.label}
					>
						<Icon className="w-3.5 h-3.5" />
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}
