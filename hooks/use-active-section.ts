"use client";

import { useEffect, useState } from "react";

/**
 * Scrollspy: reports the id of the section currently occupying the middle of
 * the viewport. `ids` must match section element ids in document order.
 */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }
        let best: { id: string; ratio: number } | null = null;
        for (const [id, ratio] of visible) {
          if (!best || ratio > best.ratio) best = { id, ratio };
        }
        if (best) setActive(best.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
