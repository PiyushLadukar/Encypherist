"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requestAdminAccount } from "@/lib/actions/admins";
import { registerAdminSchema } from "@/lib/validation/admin";
import { ORG } from "@/lib/constants";

export function AdminRegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = registerAdminSchema.safeParse({ name, email, password, confirmPassword, website });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    startTransition(async () => {
      const result = await requestAdminAccount(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="size-8 text-verified" />
        <h1 className="mt-3 font-heading text-2xl font-semibold text-foreground">Account requested</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account has been created but needs approval before you can sign in. Ask an existing
          super admin to activate it, then use your email and password on the sign-in page.
        </p>
        <Button className="mt-6 w-full" size="lg" render={<Link href="/admin/login" />}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center text-center">
        <UserPlus className="size-8 text-primary" />
        <h1 className="mt-3 font-heading text-2xl font-semibold text-foreground">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">{ORG.name} event management</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
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
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1.5"
          />
        </div>

        {/* Honeypot. Hidden from people and skipped by screen readers and tab
            order, so only a form-filling bot ever populates it. */}
        <div aria-hidden className="pointer-events-none absolute -left-[9999px] size-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <p className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          New accounts start deactivated — a super admin has to approve yours before you can sign in.
        </p>

        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/admin/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </>
  );
}
