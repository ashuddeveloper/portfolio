"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";

import { usePerfTier } from "@/hooks/use-perf-tier";
import { cn } from "@/lib/utils";

class SceneErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export interface SceneRenderOptions {
  tier: "high" | "low";
  /** false while the scene is offscreen or the tab is hidden → frameloop paused */
  active: boolean;
}

interface SceneShellProps {
  className?: string;
  /** Static, cheap stand-in — shown before mount, under the transparent canvas, and on any failure. */
  poster: ReactNode;
  children: (options: SceneRenderOptions) => ReactNode;
}

/**
 * Wraps every WebGL scene with the boring-but-critical parts:
 * - mounts the canvas only when scrolled near the viewport,
 * - pauses the frameloop when offscreen or when the tab is hidden,
 * - falls back to the poster under reduced motion or if WebGL fails,
 * - stays decorative for assistive tech (`aria-hidden`).
 */
export function SceneShell({ className, poster, children }: SceneShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tier = usePerfTier();
  const [nearViewport, setNearViewport] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mountObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNearViewport(true);
      },
      { rootMargin: "600px" },
    );
    const activityObserver = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "128px" },
    );
    mountObserver.observe(el);
    activityObserver.observe(el);
    return () => {
      mountObserver.disconnect();
      activityObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const renderCanvas = tier === "high" || tier === "low" ? nearViewport : false;

  return (
    <div ref={ref} aria-hidden="true" className={cn("relative", className)}>
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          renderCanvas && tier !== "static" ? "opacity-0" : "opacity-100",
        )}
      >
        {poster}
      </div>
      {renderCanvas && tier && tier !== "static" && (
        <SceneErrorBoundary fallback={null}>
          <div className="absolute inset-0 animate-in duration-1000 fade-in">
            {children({ tier, active: onScreen && tabVisible })}
          </div>
        </SceneErrorBoundary>
      )}
    </div>
  );
}
