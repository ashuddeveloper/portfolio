"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/effects/reveal";

interface SectionHeadingProps {
  method?: "GET" | "POST";
  route: string;
  status?: string;
  title: string;
  lede?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * Every section opens with its route — the page's structural signature.
 * `GET` sections read; the single `POST` section (contact) writes.
 */
export function SectionHeading({
  method = "GET",
  route,
  status = "200",
  title,
  lede,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal className={cn(align === "center" && "text-center", className)}>
      <p className="flex items-baseline gap-2 eyebrow" aria-hidden="true">
        <span
          className={cn(
            "font-semibold tracking-widest",
            method === "GET" ? "text-(--ion)" : "text-(--gold)",
          )}
        >
          {method}
        </span>
        <span>{route}</span>
        <span className="text-(--operational)">→ {status}</span>
      </p>
      <h2
        className={cn(
          "mt-4 font-display text-4xl font-bold tracking-tight text-balance md:text-5xl",
        )}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={cn(
            "mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {lede}
        </p>
      )}
    </Reveal>
  );
}
