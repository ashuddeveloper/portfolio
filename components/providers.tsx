"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

import { SoundProvider } from "@/hooks/use-sound";
import { ToastProvider } from "@/components/ui/toaster";
import { SmoothScroll } from "@/components/smooth-scroll";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      themes={["dark", "light"]}
      enableSystem={false}
      disableTransitionOnChange
    >
      <SoundProvider>
        <ToastProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ToastProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}
