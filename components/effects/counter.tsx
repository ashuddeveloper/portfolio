"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

interface CounterProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  durationHint?: number;
}

/** Number that counts up when scrolled into view. */
export function Counter({ value, decimals = 0, suffix = "", className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-48px" });
  const reduced = useReducedMotion();

  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 42, damping: 18, mass: 1 });
  const text = useTransform(
    spring,
    (v) => `${v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${suffix}`,
  );

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      raw.jump(value);
      spring.jump(value);
      return;
    }
    raw.set(value);
  }, [inView, raw, spring, reduced, value]);

  return (
    <motion.span ref={ref} className={className} aria-label={`${value}${suffix}`}>
      {text}
    </motion.span>
  );
}
