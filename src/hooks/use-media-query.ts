"use client";

import { useEffect, useState } from "react";
import { DESKTOP_QUERY } from "@/lib/motion";

export function useMediaQuery(query: string, defaultValue: boolean): boolean {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Defaults to `true` so first paint (and any no-JS visitor) always renders
 * the desktop tree — matches this codebase's progressive-enhancement style
 * elsewhere (DecryptText, TypewriterText). Only flips post-mount on an
 * actual sub-1024px viewport.
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY, true);
}
