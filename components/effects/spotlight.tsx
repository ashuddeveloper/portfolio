"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  /** CSS color used at the center of the glow. */
  color?: string;
  size?: number;
}

/**
 * A pointer-following radial glow. Renders inside a relatively-positioned
 * parent and listens on that parent, so it never intercepts pointer events.
 */
export function Spotlight({
  className,
  color = "var(--glow-ion)",
  size = 520,
}: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    let raf = 0;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = parent.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.background = `radial-gradient(${size}px circle at ${px}px ${py}px, ${color}, transparent 70%)`;
      });
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    parent.addEventListener("pointermove", onMove, { passive: true });
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, [color, reduced, size]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
        className,
      )}
    />
  );
}
