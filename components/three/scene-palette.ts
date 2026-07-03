"use client";

import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/use-mounted";

/** Colors handed into WebGL scenes — CSS variables can't cross the canvas boundary. */
export interface ScenePalette {
  bg: string;
  ion: string;
  violet: string;
  cyan: string;
  gold: string;
  star: string;
  /** true → light theme: normal blending + darker particles for contrast */
  light: boolean;
}

const DARK: ScenePalette = {
  bg: "#05070f",
  ion: "#62a4ff",
  violet: "#8f7bff",
  cyan: "#55d6f5",
  gold: "#e9b860",
  star: "#aecbff",
  light: false,
};

const LIGHT: ScenePalette = {
  bg: "#f3f5fb",
  ion: "#2e63d9",
  violet: "#6a50e0",
  cyan: "#0d7ea1",
  gold: "#a8741f",
  star: "#51608a",
  light: true,
};

export function useScenePalette(): ScenePalette {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();
  if (!mounted) return DARK;
  return resolvedTheme === "light" ? LIGHT : DARK;
}
