"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Fades + lifts content into view once, on scroll — a single tasteful
 * microinteraction reused across homepage sections rather than one-off
 * animations per section. Respects prefers-reduced-motion via Motion's
 * useReducedMotion, which drops the transform and just crossfades.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
