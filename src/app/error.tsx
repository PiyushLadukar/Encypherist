"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";

export default function GlobalError({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <Logo />
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-destructive">
        <AlertTriangle className="size-3.5" />
        Something broke
      </div>
      <h1 className="text-balance font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Server error.
      </h1>
      <p className="max-w-md text-balance text-muted-foreground">
        Something went wrong loading this page. It&apos;s on us — try again in a moment.
      </p>
      <Button onClick={() => reset()} className="font-mono text-sm">
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
