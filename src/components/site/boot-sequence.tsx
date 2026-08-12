"use client";

import { useEffect, useState } from "react";

const STEPS = ["INITIALIZING", "LOADING SYSTEM", "READY"];
const STEP_DELAY = 300;

/**
 * A short, session-scoped boot sequence — shows once per browser session
 * (sessionStorage-gated), never on subsequent client-side navigation within
 * the same session since layouts persist across route changes. Respects
 * prefers-reduced-motion by skipping straight to done. Total runtime target
 * is under 1.5s per the design brief — this is a first impression, not a
 * gate the visitor has to wait through.
 *
 * Every exit path (repeat visit, reduced motion, full sequence) resolves via
 * a timer rather than a bare synchronous setState in the effect body, so the
 * server-rendered "booting" markup and the client's first paint always
 * agree — no hydration mismatch, just a near-instant dismiss for repeat
 * visitors instead of a skipped first frame.
 */
export function BootSequence() {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);

  useEffect(() => {
    const alreadyBooted = sessionStorage.getItem("ency_booted");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const skip = Boolean(alreadyBooted) || reduceMotion;

    sessionStorage.setItem("ency_booted", "1");

    if (skip) {
      const skipTimer = setTimeout(() => setMounted(false), 0);
      return () => clearTimeout(skipTimer);
    }

    document.body.style.overflow = "hidden";

    const timers = STEPS.map((_, i) => setTimeout(() => setStepIndex(i), i * STEP_DELAY));
    const fadeTimer = setTimeout(() => setFading(true), STEPS.length * STEP_DELAY + 150);
    const unmountTimer = setTimeout(() => {
      setMounted(false);
      document.body.style.overflow = "";
    }, STEPS.length * STEP_DELAY + 550);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-background transition-opacity duration-400 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.12]"
      />
      <p className="relative font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        ENCYPHERIST<span className="text-primary">_</span>
      </p>
      <p className="relative h-4 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {stepIndex >= 0 ? STEPS[stepIndex] : ""}
      </p>
      <p className="relative font-mono text-[11px] tabular-nums tracking-[0.2em] text-primary">
        {String(Math.min(stepIndex + 1, STEPS.length)).padStart(2, "0")} /{" "}
        {String(STEPS.length).padStart(2, "0")}
      </p>
    </div>
  );
}
