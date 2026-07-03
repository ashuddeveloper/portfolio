"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  ArrowDownToLine,
  AtSign,
  Braces,
  Briefcase,
  Code2,
  FolderKanban,
  GraduationCap,
  Home,
  Mail,
  Moon,
  Orbit,
  Send,
  Sun,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

import { experience, person, projects, skills } from "@/lib/resume";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { withBasePath } from "@/lib/utils";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useToast } from "@/components/ui/toaster";
import { useSound } from "@/hooks/use-sound";

const OPEN_EVENT = "portfolio:command-palette";

/** Anything (navbar, shortcuts) can summon the palette through this. */
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

const SECTION_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "skills", label: "Skills", icon: Orbit },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "contact", label: "Contact", icon: Send },
] as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { enabled: soundOn, toggle: toggleSound, play } = useSound();
  const toast = useToast();
  const lenis = useLenis();
  const reduced = useReducedMotion();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
        if (target?.isContentEditable) return;
        event.preventDefault();
        setOpen(true);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpenEvent);
    };
  }, []);

  const jumpTo = useCallback(
    (id: string) => {
      setOpen(false);
      play("click");
      // wait for the dialog to release scroll lock
      requestAnimationFrame(() => {
        const target = document.getElementById(id);
        if (!target) return;
        if (lenis && !reduced) lenis.scrollTo(target, { offset: -24 });
        else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      });
    },
    [lenis, play, reduced],
  );

  const run = useCallback((action: () => void) => {
    setOpen(false);
    action();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search sections, projects, skills, actions…" />
      <CommandList>
        <CommandEmpty>404 — nothing matches that route.</CommandEmpty>

        <CommandGroup heading="navigate">
          {SECTION_ITEMS.map((item) => (
            <CommandItem key={item.id} onSelect={() => jumpTo(item.id)}>
              <item.icon />
              {item.label}
              <CommandShortcut>GET /{item.id === "home" ? "" : item.id}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="actions">
          <CommandItem
            onSelect={() =>
              run(() => {
                play("success");
                const link = document.createElement("a");
                link.href = withBasePath(person.resumeFile);
                link.download = "Ashutosh_Gupta_Resume.pdf";
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast({ title: "Résumé downloading", icon: "success" });
              })
            }
          >
            <ArrowDownToLine />
            Download résumé
            <CommandShortcut>PDF</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(async () => {
                await navigator.clipboard.writeText(person.email);
                play("success");
                toast({ title: "Email copied", description: person.email, icon: "success" });
              })
            }
          >
            <AtSign />
            Copy email address
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                play("click");
                setTheme(resolvedTheme === "light" ? "dark" : "light");
              })
            }
          >
            {resolvedTheme === "light" ? <Moon /> : <Sun />}
            Switch to {resolvedTheme === "light" ? "dark" : "light"} theme
            <CommandShortcut>theme</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => toggleSound())}>
            {soundOn ? <VolumeX /> : <Volume2 />}
            {soundOn ? "Mute interface sounds" : "Enable interface sounds"}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="projects">
          {projects.map((project) => (
            <CommandItem
              key={project.id}
              keywords={[...project.tech, project.context]}
              onSelect={() => jumpTo("projects")}
            >
              <Braces />
              {project.name}
              <CommandShortcut>{project.route}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="experience">
          {experience.map((role) => (
            <CommandItem
              key={role.id}
              keywords={[role.role, ...role.tech]}
              onSelect={() => jumpTo("experience")}
            >
              <Briefcase />
              {role.company}
              <CommandShortcut>{role.period}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="skills">
          {skills.map((skill) => (
            <CommandItem
              key={skill.name}
              keywords={[skill.category]}
              onSelect={() => jumpTo("skills")}
            >
              <Code2 />
              {skill.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="links">
          <CommandItem
            onSelect={() => run(() => window.open(person.links.github, "_blank", "noopener"))}
          >
            <GitHubIcon />
            GitHub
            <CommandShortcut>@{person.handles.github}</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => window.open(person.links.linkedin, "_blank", "noopener"))}
          >
            <LinkedInIcon />
            LinkedIn
            <CommandShortcut>in/{person.handles.linkedin}</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => window.open(person.links.codechef, "_blank", "noopener"))}
          >
            <Code2 />
            CodeChef
            <CommandShortcut>1758</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => (window.location.href = `mailto:${person.email}`))}
          >
            <Mail />
            Email {person.email}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
