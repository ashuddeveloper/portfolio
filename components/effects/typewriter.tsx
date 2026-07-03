"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface TypewriterProps {
  phrases: readonly string[];
  className?: string;
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
}

/** Types, holds, deletes and rotates through phrases. Static first phrase under reduced motion. */
export function Typewriter({
  phrases,
  className,
  typeMs = 42,
  deleteMs = 22,
  holdMs = 2200,
}: TypewriterProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const phrase = phrases[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && length < phrase.length) {
      timeout = setTimeout(() => setLength(length + 1), typeMs);
    } else if (!deleting && length === phrase.length) {
      timeout = setTimeout(() => setDeleting(true), holdMs);
    } else if (deleting && length > 0) {
      timeout = setTimeout(() => setLength(length - 1), deleteMs);
    } else {
      timeout = setTimeout(() => {
        setDeleting(false);
        setIndex((index + 1) % phrases.length);
      }, 260);
    }
    return () => clearTimeout(timeout);
  }, [phrases, index, length, deleting, reduced, typeMs, deleteMs, holdMs]);

  if (reduced) {
    return <span className={className}>{phrases[0]}</span>;
  }

  return (
    <span className={className} aria-label={phrases.join(", ")}>
      <span aria-hidden="true">{phrases[index].slice(0, length)}</span>
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] animate-pulse bg-(--ion)"
      />
    </span>
  );
}
