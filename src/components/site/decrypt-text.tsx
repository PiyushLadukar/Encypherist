"use client";

import { useEffect, useLayoutEffect, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#$%&01";

// React warns if useLayoutEffect runs during SSR; this file only ever runs
// client-side in practice (App Router SSRs it once, then hydrates), but the
// standard guard keeps that warning out of the server console.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * A "decrypting" text reveal, on brand for a club named after ciphers:
 * characters cycle through random glyphs before locking in left to right,
 * instead of a plain fade. Renders the real text for SSR/no-JS so crawlers
 * and non-JS visitors always get real content; `useLayoutEffect` swaps to a
 * scrambled starting state before the browser's first paint so JS visitors
 * never see a flash of the real text before it scrambles.
 */
export function DecryptText({
  text,
  delay = 0,
  speed = 40,
  className,
}: {
  text: string;
  /** ms before this instance starts decrypting — stagger multiple instances with this. */
  delay?: number;
  /** ms between reveal ticks. */
  speed?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);

  useIsomorphicLayoutEffect(() => {
    setDisplay(scramble(text, 0));
  }, [text]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let revealed = 0;

    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        revealed += 1;
        setDisplay(scramble(text, revealed));
        if (revealed >= text.length) {
          clearInterval(interval);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [text, delay, speed]);

  return (
    <span className={className} aria-label={text}>
      {display}
    </span>
  );
}

function scramble(text: string, revealedCount: number): string {
  return text
    .split("")
    .map((char, i) => {
      if (char === " ") return " ";
      if (i < revealedCount) return char;
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    })
    .join("");
}
