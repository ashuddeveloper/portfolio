"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown, MapPin } from "lucide-react";

import { experience, type ExperienceRole } from "@/lib/resume";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/effects/reveal";
import { Spotlight } from "@/components/effects/spotlight";
import { Badge } from "@/components/ui/badge";
import { useSound } from "@/hooks/use-sound";

const DOT_COLORS = ["var(--ion)", "var(--violet)", "var(--cyan)"];

function RoleCard({ role, index }: { role: ExperienceRole; index: number }) {
  const [open, setOpen] = useState(false);
  const { play } = useSound();
  const visibleBullets = open ? role.bullets : role.bullets.slice(0, 2);
  const detailId = `role-detail-${role.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.8, delay: index * 0.06, ease: [0.21, 0.65, 0.16, 1] }}
      className="card-hover-line relative rounded-3xl p-6 glass md:p-8"
    >
      <Spotlight color={`color-mix(in srgb, ${DOT_COLORS[index % 3]} 22%, transparent)`} />

      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <h3 className="font-display text-xl font-bold tracking-tight md:text-2xl">
            {role.company}
            {role.companyFull && (
              <span className="ml-2 hidden text-sm font-normal text-faint sm:inline">
                ({role.companyFull})
              </span>
            )}
          </h3>
          <p className="mt-1 text-sm font-medium text-(--ion)">{role.role}</p>
        </div>
        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          <span className="flex items-center gap-2 font-mono text-xs text-muted">
            {role.current && (
              <span className="flex items-center gap-1.5 text-operational">
                <span className="size-1.5 animate-pulse-dot rounded-full bg-operational" />
                LIVE
              </span>
            )}
            {role.period}
          </span>
          <span className="flex items-center gap-1 font-mono text-[0.7rem] text-faint">
            <MapPin className="size-3" />
            {role.location}
          </span>
        </div>
      </header>

      <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">{role.summary}</p>

      {/* Metric chips — the numbers recruiters scan for */}
      <dl className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {role.metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-line bg-panel px-3.5 py-3"
          >
            <dt className="sr-only">{metric.label}</dt>
            <dd>
              <span className="font-display text-lg font-bold text-(--gold) tabular-nums">
                {metric.value}
              </span>
              <span className="mt-0.5 block font-mono text-[0.62rem] leading-snug text-faint">
                {metric.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <ul className="mt-5 space-y-2.5" id={detailId}>
        {visibleBullets.map((bullet) => (
          <li
            key={bullet.slice(0, 48)}
            className="flex gap-3 text-sm leading-relaxed text-muted"
          >
            <span
              className="mt-2 h-px w-4 shrink-0"
              style={{ background: DOT_COLORS[index % 3] }}
              aria-hidden="true"
            />
            <span>
              <strong className="font-semibold text-fg">{bullet.split(" ")[0]}</strong>{" "}
              {bullet.split(" ").slice(1).join(" ")}
            </span>
          </li>
        ))}
      </ul>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="extra"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.21, 0.65, 0.16, 1] }}
            className="overflow-hidden"
          >
            {role.clients && (
              <p className="mt-4 font-mono text-xs text-muted">
                <span className="text-faint">clients:</span> {role.clients.join(" · ")}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex max-w-xl flex-wrap gap-1.5">
          {role.tech.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>
        {role.bullets.length > 2 && (
          <button
            type="button"
            data-cursor="hover"
            aria-expanded={open}
            aria-controls={detailId}
            onClick={() => {
              play("click");
              setOpen((v) => !v);
            }}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs",
              "text-muted transition-colors hover:bg-panel hover:text-fg",
            )}
          >
            {open ? "collapse" : "full detail"}
            <ChevronDown
              className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")}
            />
          </button>
        )}
      </div>
    </motion.article>
  );
}

export function Experience() {
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.78", "end 0.45"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id="experience" aria-label="Experience" className="relative section-pad">
      <div className="shell">
        <SectionHeading
          route="/experience"
          title="Where the systems shipped"
          lede="Three roles, one trajectory: from automating financial data, through probability engines, to owning agentic-AI platform architecture at enterprise scale."
        />

        <div ref={listRef} className="relative mt-16">
          {/* spine + scroll-drawn trace */}
          <div
            className="absolute top-2 bottom-2 left-[7px] w-px bg-line md:left-[9px]"
            aria-hidden="true"
          />
          <motion.div
            aria-hidden="true"
            style={{ scaleY }}
            className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-[linear-gradient(180deg,var(--ion),var(--violet)_55%,var(--gold))] md:left-[9px]"
          />

          <ol className="space-y-7">
            {experience.map((role, index) => (
              <li key={role.id} className="relative pl-9 md:pl-14">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-10 left-0 flex size-[15px] items-center justify-center rounded-full border md:size-[19px]",
                    "border-line-strong bg-(--bg)",
                  )}
                >
                  <span
                    className={cn(
                      "size-[7px] rounded-full md:size-[9px]",
                      role.current && "animate-pulse-dot",
                    )}
                    style={{ background: DOT_COLORS[index % 3] }}
                  />
                </span>
                <RoleCard role={role} index={index} />
              </li>
            ))}
          </ol>
        </div>

        <Reveal className="mt-10">
          <p className="font-mono text-xs text-faint">
            trace complete — 3 services, 0 dropped requests, promoted from Associate Intern
            within 6 months of the first one.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
