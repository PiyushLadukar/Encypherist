"use client";

import { useEffect, useLayoutEffect, useState } from "react";

// Same SSR guard as DecryptText — useLayoutEffect is a no-op warning risk
// during server rendering.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Classic terminal typewriter reveal, with a blinking cursor riding the
 * leading edge. Renders the full real text for SSR/no-JS (progressive
 * enhancement — crawlers and non-JS visitors get real content immediately);
 * `useLayoutEffect` resets to empty before the browser's first paint so JS
 * visitors never see a flash of the full paragraph before it types out.
 */
export function TypewriterText({
  text,
  delay = 0,
  speed = 18,
  className,
  as: Tag = "span",
}: {
  text: string;
  /** ms before typing starts. */
  delay?: number;
  /** ms between characters. */
  speed?: number;
  className?: string;
  as?: "span" | "p";
}) {
  const [count, setCount] = useState(text.length);
  const [typing, setTyping] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setCount(0);
    setTyping(true);
  }, [text]);

  useEffect(() => {
    if (!typing) return;
    let interval: ReturnType<typeof setInterval> | undefined;

    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        setCount((c) => {
          const next = c + 1;
          if (next >= text.length && interval) clearInterval(interval);
          return next;
        });
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [typing, text, delay, speed]);

  const complete = count >= text.length;

  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">
        {text.slice(0, count)}
        {typing && !complete && <span className="cursor-blink text-primary">|</span>}
      </span>
    </Tag>
  );
}
