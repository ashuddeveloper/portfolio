import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-32 w-full resize-y rounded-2xl p-4 text-sm text-fg glass",
      "placeholder:text-faint",
      "transition-[border-color,box-shadow] duration-300",
      "focus:border-ion/60 focus:shadow-[0_0_0_4px_var(--glow-ion)] focus:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
