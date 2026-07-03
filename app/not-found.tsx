import Link from "next/link";
import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-clip px-6 text-center">
      <div className="aurora-field" aria-hidden="true" />
      <p className="relative eyebrow">
        <span className="font-semibold tracking-widest text-(--ion)">GET</span> /this-page{" "}
        <span className="text-(--gold)">→ 404 Not Found</span>
      </p>
      <h1
        className="relative mt-5 text-aurora font-display font-extrabold tracking-tight"
        style={{ fontSize: "clamp(4rem, 16vw, 10rem)", lineHeight: 0.95 }}
      >
        404
      </h1>
      <p className="relative mt-5 max-w-md text-muted">
        No route matches that path. The rest of the system is fully operational.
      </p>
      <div className="relative mt-9">
        <Button asChild variant="aurora" size="lg">
          <Link href="/">
            <Home className="size-4" />
            GET / — back home
          </Link>
        </Button>
      </div>
    </main>
  );
}
