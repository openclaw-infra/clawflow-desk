import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					"w-full px-3 py-2.5 rounded-lg bg-input text-[var(--color-input-foreground)] font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground",
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Textarea.displayName = "Textarea";

export { Textarea };
