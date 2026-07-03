"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type SoundName = "tick" | "click" | "success";

interface SoundContextValue {
  enabled: boolean;
  toggle: () => void;
  play: (name: SoundName) => void;
}

const SoundContext = createContext<SoundContextValue>({
  enabled: false,
  toggle: () => {},
  play: () => {},
});

const STORAGE_KEY = "portfolio-sound";

/**
 * Tiny WebAudio synthesizer — no audio files, a few oscillator blips at very
 * low gain. Muted by default; the context is only created after an explicit
 * user opt-in (a user gesture), so autoplay policies are satisfied.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // deferred so the persisted preference doesn't trigger a cascading render
    const id = window.setTimeout(() => {
      if (localStorage.getItem(STORAGE_KEY) === "on") setEnabled(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const blip = useCallback(
    (frequency: number, duration: number, gainPeak: number, type: OscillatorType = "sine") => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration + 0.02);
    },
    [],
  );

  const play = useCallback(
    (name: SoundName) => {
      if (!enabled || !ctxRef.current) return;
      switch (name) {
        case "tick":
          blip(2600, 0.045, 0.012, "triangle");
          break;
        case "click":
          blip(720, 0.09, 0.03, "sine");
          blip(1440, 0.05, 0.015, "triangle");
          break;
        case "success":
          blip(660, 0.12, 0.028, "sine");
          setTimeout(() => blip(990, 0.16, 0.028, "sine"), 90);
          break;
      }
    },
    [blip, enabled],
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      if (next) {
        // Called from a click handler → safe to create the AudioContext here.
        const ctx = ensureContext();
        if (ctx) {
          setTimeout(() => blip(660, 0.12, 0.028, "sine"), 30);
          setTimeout(() => blip(990, 0.16, 0.028, "sine"), 120);
        }
      }
      return next;
    });
  }, [blip, ensureContext]);

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  return useContext(SoundContext);
}
