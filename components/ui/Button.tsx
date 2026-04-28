import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, asChild = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const variants = {
      primary: "bg-red-500 hover:bg-red-600 text-[var(--text-primary)] shadow-lg hover:shadow-red-500/20 active:scale-95",
      secondary: "bg-[var(--gray-200)] text-[var(--gray-800)] hover:bg-[var(--gray-300)] active:scale-95",
      outline: "border border-[var(--border)] bg-transparent hover:bg-[var(--gray-100)] text-[var(--text-primary)] active:scale-95",
      ghost: "hover:bg-[var(--gray-100)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95",
      destructive: "bg-red-600 hover:bg-red-700 text-[var(--text-primary)] active:scale-95",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-6 text-sm font-medium",
      lg: "h-14 px-8 text-base font-semibold",
      icon: "h-10 w-10 p-2",
    };

    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {isLoading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };