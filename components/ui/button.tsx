"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap",
    "rounded-full font-medium transition-[transform,box-shadow,background-color,border-color,color]",
    "duration-300 select-none outline-none focus-visible:outline-2 focus-visible:outline-ion",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-fg text-bg shadow-[0_8px_32px_-12px_var(--glow-ion)]",
          "hover:shadow-[0_12px_40px_-10px_var(--glow-ion)] hover:-translate-y-px active:translate-y-0",
        ].join(" "),
        aurora: [
          "text-white border border-white/10",
          "bg-[linear-gradient(120deg,var(--ion),var(--violet)_60%,var(--cyan))] bg-[length:180%_100%] bg-left",
          "shadow-[0_8px_32px_-10px_var(--glow-violet)]",
          "hover:bg-right hover:shadow-[0_14px_44px_-10px_var(--glow-ion)] hover:-translate-y-px active:translate-y-0",
          "transition-[background-position,transform,box-shadow] duration-500",
        ].join(" "),
        glass: [
          "glass text-fg",
          "hover:border-line-strong hover:-translate-y-px active:translate-y-0",
        ].join(" "),
        ghost: "text-muted hover:text-fg hover:bg-panel",
        link: "text-ion underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Paint an expanding ripple from the click point. */
  ripple?: boolean;
}

function spawnRipple(event: React.MouseEvent<HTMLElement>) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const host = event.currentTarget as HTMLElement;
  const rect = host.getBoundingClientRect();
  const span = document.createElement("span");
  const size = Math.max(rect.width, rect.height) * 2.2;
  span.style.cssText = [
    "position:absolute",
    "border-radius:9999px",
    "pointer-events:none",
    "background:radial-gradient(circle,rgba(255,255,255,0.35),transparent 70%)",
    `width:${size}px`,
    `height:${size}px`,
    `left:${event.clientX - rect.left - size / 2}px`,
    `top:${event.clientY - rect.top - size / 2}px`,
    "transform:scale(0)",
    "opacity:1",
    "transition:transform 600ms ease, opacity 700ms ease",
  ].join(";");
  host.appendChild(span);
  requestAnimationFrame(() => {
    span.style.transform = "scale(1)";
    span.style.opacity = "0";
  });
  setTimeout(() => span.remove(), 750);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ripple = true, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        data-cursor="hover"
        className={cn(buttonVariants({ variant, size }), className)}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          if (ripple) spawnRipple(event);
          onClick?.(event);
        }}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
