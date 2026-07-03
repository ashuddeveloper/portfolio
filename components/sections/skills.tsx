"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Orbit, Search } from "lucide-react";

import { skillCategories, skills, type SkillCategoryId } from "@/lib/resume";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/effects/reveal";
import { Input } from "@/components/ui/input";
import { SceneShell } from "@/components/three/scene-shell";
import { useScenePalette } from "@/components/three/scene-palette";
import { useSound } from "@/hooks/use-sound";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";

const ConstellationScene = dynamic(() => import("@/components/three/constellation-scene"), {
  ssr: false,
});

/** Static fallback shown before the canvas mounts and under reduced motion. */
function ChipCloud() {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();
  const light = mounted && resolvedTheme === "light";
  return (
    <div className="flex h-full flex-wrap content-center items-center justify-center gap-2 p-8">
      {skills.map((skill) => {
        const category = skillCategories.find((c) => c.id === skill.category)!;
        const color = light ? category.colorLight : category.color;
        return (
          <span
            key={skill.name}
            className="rounded-full border px-3 py-1 font-mono text-[0.68rem]"
            style={{
              borderColor: `${color}44`,
              color,
              background: `${color}0f`,
            }}
          >
            {skill.name}
          </span>
        );
      })}
    </div>
  );
}

export function Skills() {
  const palette = useScenePalette();
  const { play } = useSound();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SkillCategoryId | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const highlight = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !category) return null;
    return new Set(
      skills
        .filter(
          (skill) =>
            (!category || skill.category === category) &&
            (!q || skill.name.toLowerCase().includes(q)),
        )
        .map((skill) => skill.name),
    );
  }, [query, category]);

  const selectedSkill = useMemo(
    () => skills.find((skill) => skill.name === selected) ?? null,
    [selected],
  );
  const selectedCategory = selectedSkill
    ? skillCategories.find((c) => c.id === selectedSkill.category)!
    : null;
  const matchCount = highlight ? highlight.size : skills.length;

  return (
    <section id="skills" aria-label="Skills" className="relative section-pad">
      <div className="shell">
        <SectionHeading
          route="/skills"
          title="The constellation"
          lede="Every technology on my résumé, mapped as a small galaxy — seven clusters, node size showing how often each one appears across my roles. Drag to orbit, hover to inspect, click to pin."
        />

        {/* controls */}
        <Reveal className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-faint" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="search the constellation…"
              aria-label="Search skills"
              className="h-11 pl-11 font-mono text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
            <button
              type="button"
              data-cursor="hover"
              onClick={() => {
                play("tick");
                setCategory(null);
              }}
              className={cn(
                "rounded-full border px-3.5 py-1.5 font-mono text-[0.68rem] transition-all",
                !category
                  ? "border-line-strong bg-panel-strong text-fg"
                  : "border-line text-muted hover:text-fg",
              )}
            >
              all · {skills.length}
            </button>
            {skillCategories.map((entry) => {
              const active = category === entry.id;
              const color = palette.light ? entry.colorLight : entry.color;
              return (
                <button
                  key={entry.id}
                  type="button"
                  data-cursor="hover"
                  aria-pressed={active}
                  onClick={() => {
                    play("tick");
                    setCategory(active ? null : entry.id);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[0.68rem] transition-all",
                    active ? "text-fg" : "text-muted hover:text-fg",
                  )}
                  style={{
                    borderColor: active ? `${color}88` : "var(--line)",
                    background: active ? `${color}1a` : undefined,
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ background: color }} />
                  {entry.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          {/* the galaxy */}
          <Reveal>
            <div className="relative h-[26rem] overflow-hidden rounded-3xl glass md:h-[30rem]">
              <SceneShell className="absolute inset-0" poster={<ChipCloud />}>
                {({ tier, active }) => (
                  <ConstellationScene
                    tier={tier}
                    active={active}
                    palette={palette}
                    highlight={highlight}
                    selected={selected}
                    onSelect={setSelected}
                  />
                )}
              </SceneShell>
              <p className="pointer-events-none absolute bottom-4 left-5 font-mono text-[0.65rem] text-faint">
                {matchCount}/{skills.length} nodes {highlight ? "matched" : "online"} · drag to
                orbit
              </p>
            </div>
          </Reveal>

          {/* inspector */}
          <Reveal delay={0.1}>
            <div className="flex h-full min-h-64 flex-col rounded-3xl p-6 glass">
              <p className="flex items-center gap-2 eyebrow">
                <Orbit className="size-3.5 text-(--violet)" />
                node inspector
              </p>
              {selectedSkill && selectedCategory ? (
                <div className="mt-5 flex flex-1 flex-col">
                  <h3 className="font-display text-2xl font-bold tracking-tight">
                    {selectedSkill.name}
                  </h3>
                  <p
                    className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[0.68rem]"
                    style={{
                      color: palette.light
                        ? selectedCategory.colorLight
                        : selectedCategory.color,
                      borderColor: `${
                        palette.light ? selectedCategory.colorLight : selectedCategory.color
                      }55`,
                    }}
                  >
                    {selectedCategory.label}
                  </p>
                  <p className="mt-4 font-mono text-xs text-faint">
                    signal strength{" "}
                    <span className="text-(--gold)">{"●".repeat(selectedSkill.weight)}</span>
                    <span className="text-line-strong">
                      {"●".repeat(3 - selectedSkill.weight)}
                    </span>
                  </p>
                  <p className="mt-5 eyebrow">seen at</p>
                  <ul className="mt-2 space-y-1.5">
                    {selectedSkill.usedAt.map((place) => (
                      <li key={place} className="flex items-center gap-2.5 text-sm text-muted">
                        <span className="h-px w-4 bg-(--ion)" aria-hidden="true" />
                        {place}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    data-cursor="hover"
                    onClick={() => setSelected(null)}
                    className="mt-auto w-fit pt-6 font-mono text-xs text-faint transition-colors hover:text-fg"
                  >
                    release node ✕
                  </button>
                </div>
              ) : (
                <div className="mt-5 flex flex-1 flex-col gap-5 text-sm leading-relaxed text-muted">
                  <p>
                    Hover a node to identify it. Click to pin it here — you&apos;ll see where it
                    shows up across my roles and projects.
                  </p>
                  <div>
                    <p className="eyebrow">legend</p>
                    <ul className="mt-2.5 space-y-1.5 font-mono text-xs">
                      <li>
                        <span className="text-(--gold)">●●●</span> everyday tool, multiple roles
                      </li>
                      <li>
                        <span className="text-(--gold)">●●</span>
                        <span className="text-line-strong">●</span> production experience
                      </li>
                      <li>
                        <span className="text-(--gold)">●</span>
                        <span className="text-line-strong">●●</span> working knowledge
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* keyboard & screen-reader friendly list of the same data */}
        <Reveal className="mt-6">
          <details className="group rounded-3xl px-6 py-5 glass">
            <summary
              data-cursor="hover"
              className="cursor-pointer list-none font-mono text-xs text-muted transition-colors hover:text-fg"
            >
              <span className="group-open:hidden">▸ prefer a plain list?</span>
              <span className="hidden group-open:inline">▾ the same skills, listed</span>
            </summary>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {skillCategories.map((entry) => (
                <div key={entry.id}>
                  <p
                    className="font-mono text-[0.68rem] tracking-widest uppercase"
                    style={{ color: palette.light ? entry.colorLight : entry.color }}
                  >
                    {entry.label}
                  </p>
                  <ul className="mt-2.5 space-y-1">
                    {skills
                      .filter((skill) => skill.category === entry.id)
                      .map((skill) => (
                        <li key={skill.name}>
                          <button
                            type="button"
                            data-cursor="hover"
                            onClick={() => setSelected(skill.name)}
                            className={cn(
                              "text-left text-sm transition-colors",
                              selected === skill.name
                                ? "text-(--gold)"
                                : "text-muted hover:text-fg",
                            )}
                          >
                            {skill.name}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </Reveal>
      </div>
    </section>
  );
}
