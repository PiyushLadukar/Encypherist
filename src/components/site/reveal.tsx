"use client";

import { motion } from "motion/react";
import { EASE_PREMIUM } from "@/lib/motion";

/**
 * Fades + lifts + un-blurs content into view once, on scroll — a single
 * tasteful microinteraction reused across the site rather than one-off
 * animations per section. Deliberately not gated behind
 * prefers-reduced-motion: this is a one-time entrance, not the
 * continuous/autoplay motion that setting exists to suppress, and it needs
 * to actually be visible to be worth having.
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.96, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: EASE_PREMIUM }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Grid/list wrapper that cascades its `StaggerItem` children into view one
 * after another instead of popping in as a single block — the difference
 * between a page that "loads" and one that feels choreographed. Pair the two
 * the same way you'd pair a container/item variant: `Stagger` owns the
 * scroll trigger and timing, `StaggerItem` owns the per-child motion.
 */
export function Stagger({
  children,
  className,
  delay = 0,
  stagger = 0.09,
  once = true,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  as?: "div" | "ol" | "ul";
}) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0, margin: "0px 0px -10% 0px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children?: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      variants={{
        hidden: { opacity: 0, y: 28, scale: 0.96, filter: "blur(6px)" },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.55, ease: EASE_PREMIUM },
        },
      }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
