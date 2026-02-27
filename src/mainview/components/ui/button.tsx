import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-[var(--color-brand-hover)]",
				destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
				outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
				secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
				ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
				link: "text-primary underline-offset-4 hover:underline",
				success: "bg-success/15 text-success hover:bg-success/25",
			},
			size: {
				default: "px-3 py-1.5",
				sm: "px-2 py-1 text-[11px]",
				lg: "px-4 py-2 text-sm",
				icon: "h-7 w-7",
				"icon-sm": "h-6 w-6 p-1",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	}
);
Button.displayName = "Button";

export { Button, buttonVariants };
