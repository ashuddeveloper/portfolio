import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-mono text-[0.7rem] tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-line bg-panel text-muted",
        outline: "border-line-strong bg-transparent text-fg",
        ion: "border-ion/30 bg-ion/10 text-ion",
        violet: "border-violet/30 bg-violet/10 text-violet",
        gold: "border-gold/30 bg-gold/10 text-gold",
        operational: "border-operational/30 bg-operational/10 text-operational",
      },
      size: {
        sm: "px-2.5 py-0.5",
        md: "px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
