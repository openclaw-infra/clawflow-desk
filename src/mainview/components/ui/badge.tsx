import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
	{
		variants: {
			variant: {
				default: "bg-primary/15 text-primary",
				success: "bg-success/15 text-success",
				destructive: "bg-destructive/10 text-destructive",
				warning: "bg-[var(--color-discord-yellow)]/10 text-[var(--color-discord-yellow)]",
				secondary: "bg-secondary text-secondary-foreground",
				outline: "border border-border text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
