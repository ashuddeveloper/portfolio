"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";

import type { Project } from "@/lib/resume";
import { Badge } from "@/components/ui/badge";

const ACCENTS: Record<Project["accent"], { main: string; glow: string }> = {
  ion: { main: "var(--ion)", glow: "var(--glow-ion)" },
  violet: { main: "var(--violet)", glow: "var(--glow-violet)" },
  cyan: { main: "var(--cyan)", glow: "var(--glow-cyan)" },
  gold: { main: "var(--gold)", glow: "var(--glow-gold)" },
};

/** Generative cover — orbit rings and endpoint route, tinted per project. No fake screenshots. */
function CoverArt({ project }: { project: Project }) {
  const accent = ACCENTS[project.accent];
  return (
    <div
      className="relative h-44 overflow-hidden border-b border-line"
      style={{
        background: `radial-gradient(120% 160% at 85% -20%, ${accent.glow}, transparent 58%)`,
      }}
    >
      <svg
        viewBox="0 0 400 176"
        aria-hidden="true"
        className="absolute inset-0 size-full transition-transform duration-700 group-hover:scale-105"
        style={{ color: accent.main }}
      >
        <g opacity="0.5">
          <ellipse
            cx="310"
            cy="66"
            rx="150"
            ry="52"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1"
            transform="rotate(-14 310 66)"
          />
          <ellipse
            cx="310"
            cy="66"
            rx="104"
            ry="34"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="1"
            transform="rotate(-14 310 66)"
          />
          <ellipse
            cx="310"
            cy="66"
            rx="58"
            ry="18"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.65"
            strokeWidth="1"
            transform="rotate(-14 310 66)"
          />
          <circle cx="310" cy="66" r="7" fill="currentColor" fillOpacity="0.85" />
          <circle cx="416" cy="40" r="3.5" fill="currentColor" />
          <circle cx="230" cy="102" r="2.6" fill="currentColor" fillOpacity="0.8" />
          <circle cx="366" cy="16" r="2.2" fill="currentColor" fillOpacity="0.6" />
        </g>
      </svg>
      <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-(--bg)/55 px-3 py-1 font-mono text-[0.65rem] text-muted backdrop-blur-md">
        <Lock className="size-3" />
        {project.status}
      </span>
      <div className="absolute bottom-4 left-5 font-mono text-xs">
        <p className="text-muted">
          <span className="font-semibold tracking-widest text-(--ion)">GET</span>{" "}
          {project.route}
        </p>
        <p className="mt-0.5 text-(--operational)">→ 200 OK · {project.context}</p>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
}

/** Holographic tilt card: pointer-tracked rotation + sheen. */
export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const rotateX = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 });

  const handleMove = (event: React.PointerEvent) => {
    if (reduced || event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 7);
    rotateY.set((px - 0.5) * 9);
    ref.current.style.setProperty("--px", String(px));
    ref.current.style.setProperty("--py", String(py));
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.55, ease: [0.21, 0.65, 0.16, 1] }}
      style={{ perspective: 1100 }}
    >
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="group relative h-full overflow-hidden rounded-3xl glass"
      >
        {/* pointer sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(560px circle at calc(var(--px,0.5)*100%) calc(var(--py,0.5)*100%), rgba(255,255,255,0.09), transparent 46%)",
          }}
        />

        <CoverArt project={project} />

        <div className="flex flex-col gap-4 p-6">
          <div>
            <h3 className="font-display text-xl font-bold tracking-tight">{project.name}</h3>
            <p className="mt-1 text-sm text-muted">{project.tagline}</p>
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>

          <button
            type="button"
            data-cursor="hover"
            onClick={() => onOpen(project)}
            className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full font-mono text-xs text-(--ion) transition-colors hover:text-fg"
          >
            open case study
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
