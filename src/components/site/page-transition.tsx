"use client";

import { motion } from "motion/react";

/**
 * Entrance-only fade + rise applied to every route via `template.tsx`, which
 * remounts on navigation (unlike `layout.tsx`, which persists). Exit
 * animations would need AnimatePresence keyed off the pathname one level up
 * — skipped here since App Router streams the next route in before the
 * current one leaves, so a bare entrance already reads as smooth without the
 * complexity of coordinating an unmount. Not gated behind reduced-motion,
 * same reasoning as `Reveal`: a one-time 10px rise, not the sustained motion
 * that setting targets.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
