"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, type LenisRef } from "lenis/react";
import { useReducedMotion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * share one clock. Disabled entirely under reduced motion — native scroll.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    if (reduced) return;
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);
    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", ScrollTrigger.update);
    };
  }, [reduced]);

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.115, autoRaf: false, anchors: true }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
