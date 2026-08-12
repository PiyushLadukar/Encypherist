"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Invalid email or password.");
        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="mb-10">
        <Logo />
      </Link>

      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <Lock className="size-3.5" />
          Admin access
        </div>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground">Sign in</h1>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full font-mono text-sm" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>

      <p className="mt-6 max-w-sm text-center font-mono text-[11px] leading-relaxed text-muted-foreground/60">
        Demo mode — default admin login is{" "}
        <code className="text-muted-foreground">admin@encypherist.local</code> /{" "}
        <code className="text-muted-foreground">encypherist2k26</code>, unless ADMIN_EMAIL /
        ADMIN_PASSWORD are set.
      </p>
      <p className="mt-3 text-center font-mono text-xs text-muted-foreground/60">
        Forum members and visitors don&apos;t need an account —{" "}
        <Link href="/" className="text-primary">
          back to the site
        </Link>
        .
      </p>
    </div>
  );
}
