import Link from "next/link";
import { ArrowLeft, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <Logo />
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <TerminalSquare className="size-3.5 text-primary" />
        404 — route not found
      </div>
      <h1 className="text-balance font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        This path doesn&apos;t decrypt to anything.
      </h1>
      <p className="max-w-md text-balance text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist, moved, or never did. Try heading
        back to somewhere that does.
      </p>
      <Button nativeButton={false} render={<Link href="/" />} className="font-mono text-sm">
        <ArrowLeft className="size-4" />
        Back to home
      </Button>
    </div>
  );
}
