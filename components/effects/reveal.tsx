"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** seconds */
  delay?: number;
  /** initial vertical offset in px */
  y?: number;
  once?: boolean;
}

/** Scroll-triggered fade-and-rise. The workhorse reveal for every section. */
export function Reveal({ children, className, delay = 0, y = 28, once = true }: RevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-64px" }}
      transition={{ duration: 0.85, delay, ease: [0.21, 0.65, 0.16, 1] }}
    >
      {children}
    </motion.div>
  );
}

export const staggerParent: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.21, 0.65, 0.16, 1] },
  },
};

interface StaggerProps {
  children: ReactNode;
  className?: string;
  once?: boolean;
}

/** Container that reveals its `motion.*` children (using `staggerChild`) one by one. */
export function Stagger({ children, className, once = true }: StaggerProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={cn(className)}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-64px" }}
    >
      {children}
    </motion.div>
  );
}
