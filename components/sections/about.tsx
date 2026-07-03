"use client";

import { motion } from "framer-motion";
import { Compass, Sparkles } from "lucide-react";

import { aboutActs, interests, philosophy, strengths } from "@/lib/resume";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, staggerChild } from "@/components/effects/reveal";
import { Spotlight } from "@/components/effects/spotlight";
import { Badge } from "@/components/ui/badge";

/**
 * The professional journey in three acts — Data → Engines → Platforms —
 * each act lifted straight from a résumé role.
 */
export function About() {
  return (
    <section id="about" aria-label="About" className="relative overflow-clip section-pad">
      <div className="grid-layer" aria-hidden="true" />
      <div className="relative shell">
        <SectionHeading
          route="/about"
          title="A backend story in three acts"
          lede="Six years, three domains, one thread: systems that have to be correct, fast, and owned end-to-end — from financial reconciliation to probability engines to agentic-AI platforms."
        />

        {/* Three acts */}
        <Stagger className="mt-16 grid gap-5 md:grid-cols-3">
          {aboutActs.map((act) => (
            <motion.article
              key={act.id}
              variants={staggerChild}
              className="group card-hover-line relative rounded-3xl p-7 glass transition-transform duration-500 hover:-translate-y-1.5"
            >
              <Spotlight />
              <p className="flex items-center justify-between eyebrow">
                <span className="text-(--gold)">{act.index}</span>
                <span>{act.years}</span>
              </p>
              <h3 className="mt-5 font-display text-3xl font-bold tracking-tight">
                {act.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-faint">{act.place}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">{act.body}</p>
            </motion.article>
          ))}
        </Stagger>

        {/* Philosophy + strengths */}
        <div className="mt-16 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <div className="relative h-full rounded-3xl p-7 glass md:p-9">
              <Spotlight color="var(--glow-violet)" />
              <p className="flex items-center gap-2 eyebrow">
                <Compass className="size-3.5 text-(--violet)" />
                operating principles
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                {philosophy.map((principle, i) => (
                  <div key={principle.title}>
                    <p className="font-mono text-xs text-(--gold)">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h4 className="mt-2 font-display text-base font-bold">{principle.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{principle.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative flex h-full flex-col gap-7 rounded-3xl p-7 glass">
              <Spotlight color="var(--glow-gold)" />
              <div>
                <p className="eyebrow">core strengths</p>
                <ul className="mt-4 space-y-2.5">
                  {strengths.map((strength) => (
                    <li key={strength} className="flex items-center gap-3 text-sm text-fg">
                      <span className="h-px w-5 shrink-0 bg-(--gold)" aria-hidden="true" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto">
                <p className="flex items-center gap-2 eyebrow">
                  <Sparkles className="size-3.5 text-(--cyan)" />
                  currently exploring
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="ion" size="md">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
