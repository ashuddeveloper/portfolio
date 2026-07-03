"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Precision dot + lagging ring cursor. Activates only on fine pointers,
 * disabled entirely under reduced motion. Elements opt into the enlarged
 * ring state via `data-cursor="hover"`.
 */
export function CustomCursor() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 300, damping: 26, mass: 0.7 });
  const ringY = useSpring(y, { stiffness: 300, damping: 26, mass: 0.7 });

  useEffect(() => {
    if (reduced) return;
    const fine = window.matchMedia("(pointer: fine)");
    if (!fine.matches) return;

    const activateId = window.setTimeout(() => setActive(true), 0);
    document.documentElement.classList.add("custom-cursor");

    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const over = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      setHovering(
        Boolean(target?.closest('[data-cursor="hover"], a, button, [role="button"]')),
      );
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setVisible(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);

    return () => {
      window.clearTimeout(activateId);
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [reduced, x, y]);

  if (reduced || !active) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-120">
      {/* precise dot */}
      <motion.div
        className="absolute size-1.5 rounded-full bg-(--ion)"
        style={{ x, y, translateX: "-50%", translateY: "-50%", opacity: visible ? 1 : 0 }}
      />
      {/* lagging ring */}
      <motion.div
        className="absolute rounded-full border border-(--ion)"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 44 : 28,
          height: hovering ? 44 : 28,
          opacity: visible ? (hovering ? 0.9 : 0.45) : 0,
          scale: pressed ? 0.8 : 1,
          backgroundColor: hovering
            ? "color-mix(in srgb, var(--ion) 10%, transparent)"
            : "rgba(0,0,0,0)",
        }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
      />
    </div>
  );
}
