"use client";

import { useSyncExternalStore } from "react";

export type PerfTier = "high" | "low" | "static";

interface NavigatorPerfHints extends Navigator {
  deviceMemory?: number;
}

const emptySubscribe = () => () => {};

function computeTier(): PerfTier {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";
  const nav = navigator as NavigatorPerfHints;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 768;
  return cores <= 4 || memory <= 4 || (coarse && small) ? "low" : "high";
}

/**
 * Decide how much GPU work this device should be asked to do.
 * - "static": user prefers reduced motion → no WebGL at all, show posters.
 * - "low":    mobile / few cores / little memory → smaller particle budgets.
 * - "high":   everything on.
 * `null` during SSR, before the client can be inspected.
 */
export function usePerfTier(): PerfTier | null {
  return useSyncExternalStore(emptySubscribe, computeTier, () => null);
}

/** Particle/node budgets per tier, shared by the 3D scenes. */
export const PERF_BUDGET = {
  high: { stars: 2600, orbitNodes: 21, pulses: 10, dpr: [1, 1.75] as [number, number] },
  low: { stars: 900, orbitNodes: 12, pulses: 5, dpr: [1, 1.25] as [number, number] },
} as const;
