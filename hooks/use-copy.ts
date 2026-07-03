"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Clipboard helper with a self-resetting "copied" flag for success animations. */
export function useCopy(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetAfterMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetAfterMs],
  );

  return { copied, copy };
}
