"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registrationSchema, type RegistrationInput } from "@/lib/validation/registration";

const EMPTY: RegistrationInput = {
  full_name: "",
  email: "",
  phone: "",
  college: "",
  branch: "",
  year: "",
};

type Status = "idle" | "submitting" | "success" | "error";

export function RegistrationForm({ eventSlug, eventTitle }: { eventSlug: string; eventTitle: string }) {
  const [values, setValues] = useState<RegistrationInput>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegistrationInput, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function update<K extends keyof RegistrationInput>(key: K, value: RegistrationInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const parsed = registrationSchema.safeParse(values);
    if (!parsed.success) {
      const errors: Partial<Record<keyof RegistrationInput, string>> = {};
      for (const [key, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (messages?.[0]) errors[key as keyof RegistrationInput] = messages[0];
      }
      setFieldErrors(errors);
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch(`/api/events/${eventSlug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Network error — check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="corner-brackets border border-verified/30 bg-verified/5 px-6 py-10 text-center sm:px-10 sm:py-14">
        <CheckCircle2 className="mx-auto size-9 text-verified" />
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-verified">
          {"// REGISTRATION_CONFIRMED"}
        </p>
        <p className="mt-2 font-heading text-2xl font-semibold text-foreground">
          You&apos;re on the list.
        </p>
        <dl className="mx-auto mt-6 max-w-xs space-y-2 border-t border-verified/20 pt-6 text-left font-mono text-xs">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">EVENT //</dt>
            <dd className="truncate text-foreground">{eventTitle}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">NAME //</dt>
            <dd className="truncate text-foreground">{values.full_name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">EMAIL //</dt>
            <dd className="truncate text-foreground">{values.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">STATUS //</dt>
            <dd className="text-verified">CONFIRMED</dd>
          </div>
        </dl>
        <p className="mt-6 max-w-sm text-sm text-muted-foreground">
          Keep an eye on your email for updates from the forum.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field
        id="full_name"
        label="Full name"
        value={values.full_name}
        onChange={(v) => update("full_name", v)}
        error={fieldErrors.full_name}
        autoComplete="name"
      />
      <Field
        id="email"
        label="Email"
        type="email"
        value={values.email}
        onChange={(v) => update("email", v)}
        error={fieldErrors.email}
        autoComplete="email"
      />
      <Field
        id="phone"
        label="Phone"
        type="tel"
        value={values.phone}
        onChange={(v) => update("phone", v)}
        error={fieldErrors.phone}
        autoComplete="tel"
      />
      <Field
        id="college"
        label="College"
        value={values.college}
        onChange={(v) => update("college", v)}
        error={fieldErrors.college}
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          id="branch"
          label="Branch (optional)"
          value={values.branch ?? ""}
          onChange={(v) => update("branch", v)}
          error={fieldErrors.branch}
        />
        <Field
          id="year"
          label="Year (optional)"
          value={values.year ?? ""}
          onChange={(v) => update("year", v)}
          error={fieldErrors.year}
        />
      </div>

      {status === "error" && errorMessage && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full font-mono text-sm" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit registration"
        )}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1.5"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
