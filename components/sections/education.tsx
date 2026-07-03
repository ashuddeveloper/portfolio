"use client";

import { motion } from "framer-motion";
import { Award, GraduationCap, Heart, Trophy, Users } from "lucide-react";

import { community, credentials, education } from "@/lib/resume";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, staggerChild } from "@/components/effects/reveal";
import { Spotlight } from "@/components/effects/spotlight";
import { Badge } from "@/components/ui/badge";

const COMMUNITY_ICONS = [GraduationCap, Users, Heart];

export function Education() {
  return (
    <section
      id="education"
      aria-label="Education"
      className="relative overflow-clip section-pad"
    >
      <div className="grid-layer" aria-hidden="true" />
      <div className="relative shell">
        <SectionHeading
          route="/education"
          title="Foundations & credentials"
          lede="Formal computer-science training, an industry certification, and the competitive-programming habit that keeps the fundamentals sharp."
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          {/* degrees */}
          <Stagger className="relative space-y-5">
            {education.map((degree) => (
              <motion.article
                key={degree.id}
                variants={staggerChild}
                className="card-hover-line relative overflow-hidden rounded-3xl p-7 glass"
              >
                <Spotlight />
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl glass">
                      <GraduationCap className="size-5 text-(--ion)" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold tracking-tight">
                        {degree.degree}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {degree.institute}, {degree.place}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-mono text-xs text-faint">{degree.period}</span>
                    <Badge variant="gold" size="md">
                      {degree.short} · {degree.score}
                    </Badge>
                  </div>
                </div>
              </motion.article>
            ))}

            {/* credentials */}
            <motion.div variants={staggerChild} className="grid gap-5 sm:grid-cols-2">
              {credentials.map((credential) => (
                <article
                  key={credential.id}
                  className="card-hover-line relative rounded-3xl p-6 glass"
                >
                  <Spotlight color="var(--glow-gold)" />
                  {credential.kind === "certification" ? (
                    <Award className="size-5 text-(--gold)" />
                  ) : (
                    <Trophy className="size-5 text-(--gold)" />
                  )}
                  <h3 className="mt-4 font-display text-base leading-snug font-bold">
                    {credential.title}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-faint">{credential.issuer}</p>
                  <p className="mt-3 text-sm text-muted">{credential.detail}</p>
                </article>
              ))}
            </motion.div>
          </Stagger>

          {/* community & leadership */}
          <Reveal delay={0.1}>
            <div className="relative flex h-full flex-col rounded-3xl p-7 glass">
              <Spotlight color="var(--glow-violet)" />
              <p className="eyebrow">beyond the terminal</p>
              <ul className="mt-6 flex flex-1 flex-col gap-6">
                {community.map((item, i) => {
                  const Icon = COMMUNITY_ICONS[i % COMMUNITY_ICONS.length];
                  return (
                    <li key={item.title} className="flex gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl glass">
                        <Icon className="size-4 text-(--violet)" />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-fg">{item.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-8 border-t border-line pt-5 font-mono text-xs leading-relaxed text-faint">
                Teaching DSA monthly keeps my own fundamentals honest — the same ones behind a
                CodeChef rating of <span className="text-(--gold)">1758</span>.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
