"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Command as CommandIcon, Menu, Volume2, VolumeX, X } from "lucide-react";
import { useLenis } from "lenis/react";

import { person, sections } from "@/lib/resume";
import { cn } from "@/lib/utils";
import { useActiveSection } from "@/hooks/use-active-section";
import { useSound } from "@/hooks/use-sound";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { openCommandPalette } from "@/components/navigation/command-palette";

const NAV_SECTIONS = sections.filter((section) => section.id !== "home");

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionIds = useMemo(() => sections.map((s) => s.id), []);
  const active = useActiveSection(sectionIds);
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const { enabled: soundOn, toggle: toggleSound, play } = useSound();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll while the mobile menu is open
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  const jumpTo = (id: string) => {
    play("tick");
    setMenuOpen(false);
    const target = document.getElementById(id);
    if (!target) return;
    if (lenis && !reduced) lenis.scrollTo(target, { offset: -24 });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <>
      <motion.header
        initial={reduced ? false : { y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.21, 0.65, 0.16, 1] }}
        className="fixed inset-x-0 top-0 z-70 flex justify-center px-4 pt-4"
      >
        <div
          className={cn(
            "flex w-full max-w-5xl items-center justify-between gap-4 rounded-full px-4 py-2 transition-all duration-500 sm:px-5",
            scrolled ? "shadow-lg glass-strong" : "border border-transparent",
          )}
        >
          {/* monogram */}
          <button
            type="button"
            data-cursor="hover"
            onClick={() => jumpTo("home")}
            aria-label="Back to top"
            className="flex items-center gap-3"
          >
            <span className="flex size-9 items-center justify-center rounded-full font-display text-sm font-extrabold text-(--gold) glass">
              AG
            </span>
            <span className="hidden font-mono text-xs text-muted md:block">
              ashutosh<span className="text-(--ion)">.gupta</span>
              <span className="ml-2 inline-flex items-center gap-1 text-[0.65rem] text-operational">
                <span className="size-1 animate-pulse-dot rounded-full bg-operational" />
                200 OK
              </span>
            </span>
          </button>

          {/* desktop nav */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_SECTIONS.map((section) => {
                const isActive = active === section.id;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      data-cursor="hover"
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => jumpTo(section.id)}
                      className={cn(
                        "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                        isActive ? "text-fg" : "text-muted hover:text-fg",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-pill"
                          className="absolute inset-0 rounded-full bg-panel-strong"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">{section.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={soundOn ? "Mute interface sounds" : "Enable interface sounds"}
              onClick={toggleSound}
            >
              {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open command palette (⌘K)"
              onClick={() => {
                play("click");
                openCommandPalette();
              }}
              className="hidden sm:inline-flex"
            >
              <CommandIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => {
                play("click");
                setMenuOpen((v) => !v);
              }}
              className="lg:hidden"
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-60 flex flex-col glass-strong lg:hidden"
          >
            <div className="aurora-field" aria-hidden="true" style={{ opacity: 0.3 }} />
            <nav
              aria-label="Mobile"
              className="relative shell flex flex-1 flex-col justify-center gap-1 py-24"
            >
              {NAV_SECTIONS.map((section, i) => (
                <motion.button
                  key={section.id}
                  type="button"
                  initial={reduced ? false : { opacity: 0, x: -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.45, ease: [0.21, 0.65, 0.16, 1] }}
                  onClick={() => jumpTo(section.id)}
                  className="group flex items-baseline gap-4 py-3 text-left"
                >
                  <span className="w-20 shrink-0 font-mono text-xs text-faint">
                    <span
                      className={section.method === "POST" ? "text-(--gold)" : "text-(--ion)"}
                    >
                      {section.method}
                    </span>{" "}
                    {section.route}
                  </span>
                  <span
                    className={cn(
                      "font-display text-4xl font-bold tracking-tight transition-colors",
                      active === section.id ? "text-fg" : "text-muted group-hover:text-fg",
                    )}
                  >
                    {section.label}
                  </span>
                </motion.button>
              ))}
              <motion.p
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-10 font-mono text-xs text-faint"
              >
                {person.email} · {person.location}
              </motion.p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
