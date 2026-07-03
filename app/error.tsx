"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-clip px-6 text-center">
      <div className="aurora-field" aria-hidden="true" />
      <p className="relative eyebrow">
        <span className="font-semibold tracking-widest text-(--gold)">GET</span> /{" "}
        <span className="text-(--gold)">→ 500 Internal Error</span>
      </p>
      <h1 className="relative mt-5 font-display text-5xl font-extrabold tracking-tight md:text-7xl">
        Something broke.
      </h1>
      <p className="relative mt-5 max-w-md text-muted">
        The page hit an unexpected exception. A retry usually clears it — the service itself is
        fine.
      </p>
      <div className="relative mt-9">
        <Button variant="aurora" size="lg" onClick={reset}>
          <RotateCcw className="size-4" />
          Retry request
        </Button>
      </div>
    </main>
  );
}
