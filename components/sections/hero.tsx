"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDownToLine, Cpu, Orbit, Sparkles, Terminal } from "lucide-react";
import { useLenis } from "lenis/react";

import { person, rotatingRoles, stats } from "@/lib/resume";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { withBasePath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/effects/counter";
import { KONAMI_EVENT } from "@/components/effects/konami";
import { Magnetic } from "@/components/effects/magnetic";
import { Stagger, staggerChild } from "@/components/effects/reveal";
import { Typewriter } from "@/components/effects/typewriter";
import { SceneShell } from "@/components/three/scene-shell";
import { useScenePalette } from "@/components/three/scene-palette";
import { useSound } from "@/hooks/use-sound";

const HeroScene = dynamic(() => import("@/components/three/hero-scene"), { ssr: false });

const telemetry = [
  { label: "runtime", value: "agentic-ai" },
  { label: "latency", value: "24ms" },
  { label: "signal", value: "99.9%" },
];

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Static stand-in behind (and before) the WebGL canvas. */
function HeroPoster() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute top-1/2 left-1/2 h-[46rem] w-[46rem] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, var(--glow-gold) 0%, var(--glow-violet) 32%, transparent 62%)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneWrapRef = useRef<HTMLDivElement>(null);
  const palette = useScenePalette();
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const { play } = useSound();

  // Cinematic hand-off: the 3D system recedes as you scroll into the page.
  useGSAP(
    () => {
      if (reduced || !sceneWrapRef.current) return;
      gsap.to(sceneWrapRef.current, {
        opacity: 0.12,
        scale: 1.07,
        yPercent: 9,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.4,
        },
      });
    },
    { scope: sectionRef },
  );

  const scrollToContact = () => {
    play("click");
    const target = document.getElementById("contact");
    if (!target) return;
    if (lenis && !reduced) lenis.scrollTo(target, { offset: -24 });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      aria-label="Introduction"
      className="hero-stage relative flex min-h-svh flex-col overflow-clip"
    >
      <div className="aurora-field" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div ref={sceneWrapRef} className="absolute inset-0 will-change-transform">
        {/* offset so the orbital core sits clear of the copy: right on desktop, up on mobile */}
        <SceneShell
          className="absolute inset-0 origin-top -translate-y-[22%] scale-[0.8] opacity-65 md:left-[24%] md:translate-y-0 md:scale-100 md:opacity-100"
          poster={<HeroPoster />}
        >
          {({ tier, active }) => <HeroScene tier={tier} active={active} palette={palette} />}
        </SceneShell>
      </div>
      {/* soft floor so text stays readable over the scene */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent to-(--bg)"
      />
      <div className="hero-hud pointer-events-none absolute inset-0 z-5" aria-hidden="true">
        <div className="hero-hud-panel hero-hud-panel-a">
          <Cpu className="size-4 text-(--ion)" />
          <span>neural runtime</span>
        </div>
        <div className="hero-hud-panel hero-hud-panel-b">
          <Orbit className="size-4 text-(--gold)" />
          <span>orbit mesh</span>
        </div>
        <div className="hero-hud-panel hero-hud-panel-c">
          <Sparkles className="size-4 text-(--cyan)" />
          <span>play mode</span>
        </div>
      </div>

      <div className="relative z-10 shell flex flex-1 flex-col justify-center pt-32 pb-28 md:pt-36">
        <Stagger className="max-w-3xl">
          <motion.p variants={staggerChild} className="eyebrow" aria-hidden="true">
            <span className="font-semibold tracking-widest text-(--ion)">GET</span> /{" "}
            <span className="text-(--operational)">→ 200 OK</span>
            <span className="mx-2 text-(--text-faint)">·</span>
            {person.location}
          </motion.p>

          <motion.div variants={staggerChild} className="mt-5">
            <span className="hero-status inline-flex items-center gap-2.5 px-4 py-1.5 font-mono text-xs text-muted glass">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-operational" />
              <span>
                <span className="text-operational">OPERATIONAL</span> — {person.title} @ UKG
              </span>
            </span>
          </motion.div>

          <motion.h1
            variants={staggerChild}
            className="hero-title mt-7 font-display leading-[0.93] font-extrabold tracking-tight text-balance"
            style={{ fontSize: "clamp(3.1rem, 9.5vw, 7.25rem)" }}
          >
            <span className="block">{person.firstName}</span>
            <span className="block text-aurora">{person.lastName}</span>
          </motion.h1>

          <motion.p
            variants={staggerChild}
            className="mt-7 text-lg leading-relaxed text-muted md:text-xl"
          >
            {person.title} · {person.tagline}
            <span className="mt-1.5 block text-fg">
              I build{" "}
              <Typewriter phrases={rotatingRoles} className="font-medium text-(--ion)" />
            </span>
          </motion.p>

          <motion.p
            variants={staggerChild}
            className="mt-5 max-w-xl text-sm leading-relaxed text-muted md:text-base"
          >
            {person.intro}
          </motion.p>

          <motion.div
            variants={staggerChild}
            className="mt-9 flex flex-wrap items-center gap-3.5"
          >
            <Magnetic>
              <Button asChild variant="aurora" size="lg" ripple={false}>
                <a
                  href={withBasePath(person.resumeFile)}
                  download="Ashutosh_Gupta_Resume.pdf"
                  onClick={() => play("success")}
                >
                  <ArrowDownToLine className="size-4" />
                  Download résumé
                </a>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button variant="glass" size="lg" onClick={scrollToContact} className="font-mono">
                <Terminal className="size-4 text-(--gold)" />
                POST /contact
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                variant="glass"
                size="lg"
                onClick={() => {
                  play("click");
                  window.dispatchEvent(new Event(KONAMI_EVENT));
                }}
                className="hero-warp-button font-mono"
              >
                <Sparkles className="size-4 text-(--cyan)" />
                Warp scene
              </Button>
            </Magnetic>
            <Magnetic>
              <Button asChild variant="glass" size="lg" className="font-mono">
                <Link href="/v2">
                  <Sparkles className="size-4 text-(--cyan)" />
                  View 2.0
                </Link>
              </Button>
            </Magnetic>
            <div className="flex items-center gap-2.5">
              <Button asChild variant="glass" size="icon" aria-label="GitHub profile">
                <a href={person.links.github} target="_blank" rel="noopener noreferrer">
                  <GitHubIcon className="size-4.5" />
                </a>
              </Button>
              <Button asChild variant="glass" size="icon" aria-label="LinkedIn profile">
                <a href={person.links.linkedin} target="_blank" rel="noopener noreferrer">
                  <LinkedInIcon className="size-4.5" />
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            variants={staggerChild}
            className="hero-telemetry mt-7 grid max-w-xl grid-cols-3 gap-2.5"
            aria-hidden="true"
          >
            {telemetry.map((item) => (
              <div key={item.label} className="hero-telemetry-cell">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </motion.div>

          {/* Ops-strip statistics — every number is on the résumé */}
          <motion.dl
            variants={staggerChild}
            className="mt-12 grid max-w-2xl grid-cols-2 divide-line rounded-2xl glass sm:grid-cols-4 sm:divide-x"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="px-5 py-4">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <Counter
                    value={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                    className="font-display text-2xl font-bold text-(--gold) tabular-nums"
                  />
                  <span className="mt-1 block font-mono text-[0.65rem] leading-tight tracking-wide text-faint">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </Stagger>
      </div>

      <div aria-hidden="true" className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-12 w-7 items-start justify-center rounded-full border border-line-strong pt-2.5">
          <div className="scroll-hint-dot h-2 w-1 rounded-full bg-(--ion)" />
        </div>
      </div>
    </section>
  );
}
