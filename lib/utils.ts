import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Base path for static hosting under a sub-directory (e.g. GitHub Pages). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a public asset path with the configured base path. */
export function withBasePath(path: string) {
  return `${BASE_PATH}${path}`;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ashuddeveloper.github.io/portfolio";

/** Deterministic pseudo-random generator (mulberry32) — keeps 3D layouts stable across renders. */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
