"use client";

import { useCallback } from "react";

import { useKonami } from "@/hooks/use-konami";
import { useSound } from "@/hooks/use-sound";
import { useToast } from "@/components/ui/toaster";

/** Custom event the hero 3D scene listens to for its warp boost. */
export const KONAMI_EVENT = "portfolio:konami";

function burst() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#e9b860", "#62a4ff", "#8f7bff", "#55d6f5"];
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:130;overflow:hidden";
  document.body.appendChild(host);

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  for (let i = 0; i < 48; i++) {
    const p = document.createElement("span");
    const size = 3 + Math.random() * 5;
    p.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;border-radius:9999px;background:${colors[i % colors.length]}`;
    host.appendChild(p);
    const angle = (i / 48) * Math.PI * 2 + Math.random() * 0.4;
    const distance = 140 + Math.random() * Math.min(cx, cy) * 0.9;
    p.animate(
      [
        { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
        {
          transform: `translate(${Math.cos(angle) * distance - 50}%, ${
            Math.sin(angle) * distance - 50
          }%) scale(0)`,
          opacity: 0,
        },
      ],
      {
        duration: 900 + Math.random() * 500,
        easing: "cubic-bezier(0.16,1,0.3,1)",
        fill: "forwards",
      },
    );
  }
  setTimeout(() => host.remove(), 1600);
}

/** ↑↑↓↓←→←→BA — a professional-grade easter egg. */
export function KonamiEasterEgg() {
  const toast = useToast();
  const { play } = useSound();

  const unlock = useCallback(() => {
    burst();
    play("success");
    window.dispatchEvent(new CustomEvent(KONAMI_EVENT));
    toast({
      title: "// konami accepted — thrusters engaged",
      description: "Curiosity is a hiring signal. Say hi: ashuddeveloper@gmail.com",
      icon: "sparkles",
      durationMs: 5200,
    });
  }, [play, toast]);

  useKonami(unlock);
  return null;
}
