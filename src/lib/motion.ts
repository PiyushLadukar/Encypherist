export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  micro: 0.16, // 100-180ms — tap/press feedback
  standard: 0.4, // 300-500ms — standard transitions
  section: 0.6, // 500-700ms — section-level reveals
  heroSequence: 1.35, // 1200-1500ms — hero choreography total
} as const;

export const DESKTOP_QUERY = "(min-width: 1024px)";
