import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "h-12 w-full rounded-2xl px-4 text-sm text-fg glass",
        "placeholder:text-faint",
        "transition-[border-color,box-shadow] duration-300",
        "focus:border-ion/60 focus:shadow-[0_0_0_4px_var(--glow-ion)] focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
