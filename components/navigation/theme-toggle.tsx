"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/use-mounted";
import { useSound } from "@/hooks/use-sound";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const { play } = useSound();
  const isDark = resolvedTheme !== "light";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      onClick={() => {
        play("click");
        setTheme(isDark ? "light" : "dark");
      }}
    >
      {mounted ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            className="flex"
          >
            {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </motion.span>
        </AnimatePresence>
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
