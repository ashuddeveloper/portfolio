"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { GitHubIcon } from "@/components/icons";

import {
  person,
  projectCategories,
  projects,
  type Project,
  type ProjectCategory,
} from "@/lib/resume";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/effects/reveal";
import { ProjectCard } from "@/components/sections/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useSound } from "@/hooks/use-sound";

function CaseStudy({ project }: { project: Project }) {
  return (
    <div className="max-h-[76vh] overflow-y-auto pr-1">
      <p className="eyebrow" aria-hidden="true">
        <span className="font-semibold tracking-widest text-(--ion)">GET</span> {project.route}{" "}
        <span className="text-(--operational)">→ 200</span>
      </p>
      <DialogTitle className="mt-3 text-2xl">{project.name}</DialogTitle>
      <DialogDescription className="mt-1">
        {project.tagline} · <span className="font-mono text-xs">{project.context}</span>
      </DialogDescription>

      <div className="mt-6 space-y-5">
        <div>
          <h4 className="eyebrow">challenge</h4>
          <p className="mt-2 text-sm leading-relaxed text-muted">{project.challenge}</p>
        </div>
        <div>
          <h4 className="eyebrow">solution</h4>
          <p className="mt-2 text-sm leading-relaxed text-muted">{project.solution}</p>
        </div>
        <div>
          <h4 className="eyebrow">features</h4>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {project.features.map((feature) => (
              <li
                key={feature}
                className="rounded-xl border border-line bg-panel px-3 py-2 text-xs leading-relaxed text-muted"
              >
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="eyebrow">outcomes</h4>
          <ul className="mt-2 space-y-2">
            {project.outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-2.5 text-sm text-fg">
                <span className="mt-1 text-(--gold)" aria-hidden="true">
                  ✦
                </span>
                {outcome}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <Badge key={tech} variant="ion">
              {tech}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <span className="font-mono text-[0.7rem] text-faint">{project.status}</span>
          <Button asChild variant="glass" size="sm">
            <a href={person.links.github} target="_blank" rel="noopener noreferrer">
              <GitHubIcon className="size-3.5" />
              more on GitHub
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const [category, setCategory] = useState<ProjectCategory | "all">("all");
  const [active, setActive] = useState<Project | null>(null);
  const { play } = useSound();

  const visible = useMemo(
    () => (category === "all" ? projects : projects.filter((p) => p.category === category)),
    [category],
  );

  return (
    <section id="projects" aria-label="Projects" className="relative overflow-clip section-pad">
      <div className="aurora-field" aria-hidden="true" style={{ opacity: 0.22 }} />
      <div className="relative shell">
        <SectionHeading
          route="/projects"
          title="Selected platform work"
          lede="Enterprise systems I architected or built — each one proprietary, each one in production. Open a case study for the challenge, the solution, and what it changed."
        />

        {/* filter — animated route tabs */}
        <Reveal className="mt-10">
          <div
            role="tablist"
            aria-label="Filter projects by domain"
            className="inline-flex flex-wrap gap-1 rounded-full p-1.5 glass"
          >
            {projectCategories.map((entry) => {
              const selected = category === entry.id;
              return (
                <button
                  key={entry.id}
                  role="tab"
                  aria-selected={selected}
                  data-cursor="hover"
                  onClick={() => {
                    play("tick");
                    setCategory(entry.id);
                  }}
                  className={cn(
                    "relative rounded-full px-4 py-2 font-mono text-xs transition-colors",
                    selected ? "text-bg" : "text-muted hover:text-fg",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="project-filter-pill"
                      className="absolute inset-0 rounded-full bg-fg"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">{entry.label}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <motion.div layout className="mt-8 grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={(p) => {
                  play("click");
                  setActive(p);
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <Reveal className="mt-10">
          <a
            href={person.links.github}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="group inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-fg"
          >
            <GitHubIcon className="size-4" />
            more engineering at github.com/{person.handles.github}
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Reveal>
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && <CaseStudy project={active} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
