"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/** Hairline reading-progress bar pinned above everything. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-80 h-[2px] origin-left bg-[linear-gradient(90deg,var(--ion),var(--violet)_55%,var(--gold))]"
      style={{ scaleX }}
    />
  );
}
