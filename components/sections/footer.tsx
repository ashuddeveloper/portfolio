"use client";

import { ArrowUp } from "lucide-react";
import { useLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

import { person, sections } from "@/lib/resume";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/use-sound";

export function Footer() {
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const { play } = useSound();
  const year = new Date().getFullYear();

  const jumpTo = (id: string) => {
    play("tick");
    const target = document.getElementById(id);
    if (!target) return;
    if (lenis && !reduced) lenis.scrollTo(target, { offset: -24 });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <footer className="relative border-t border-line" role="contentinfo">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--ion),var(--violet),var(--gold),transparent)] opacity-60"
      />
      <div className="shell flex flex-col gap-10 py-14">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="font-display text-lg font-bold tracking-tight">{person.name}</p>
            <p className="mt-1 font-mono text-xs text-faint">
              {person.title} · {person.tagline}
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3">
              {sections
                .filter((section) => section.id !== "home")
                .map((section) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      data-cursor="hover"
                      onClick={() => jumpTo(section.id)}
                      className="font-mono text-xs text-muted transition-colors hover:text-fg"
                    >
                      <span
                        className={section.method === "POST" ? "text-(--gold)" : "text-(--ion)"}
                      >
                        {section.method}
                      </span>{" "}
                      {section.route}
                    </button>
                  </li>
                ))}
            </ul>
          </nav>

          <Button
            variant="glass"
            size="icon"
            aria-label="Back to top"
            onClick={() => {
              play("click");
              if (lenis && !reduced) lenis.scrollTo(0);
              else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
            }}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="font-mono text-[0.68rem] text-faint">
            © {year} {person.name} · uptime 99.9% · {person.location}
          </p>
          <p className="font-mono text-[0.68rem] text-faint">
            Next.js · React Three Fiber · Framer Motion
            <span className="mx-2 text-line-strong">|</span>
            <span aria-hidden="true" title="try it">
              ↑↑↓↓←→←→BA
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
