"use client";

import { useEffect } from "react";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** Fires `onUnlock` when the Konami code is typed anywhere on the page. */
export function useKonami(onUnlock: () => void) {
  useEffect(() => {
    let progress = 0;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === SEQUENCE[progress]) {
        progress += 1;
        if (progress === SEQUENCE.length) {
          progress = 0;
          onUnlock();
        }
      } else {
        progress = key === SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onUnlock]);
}
