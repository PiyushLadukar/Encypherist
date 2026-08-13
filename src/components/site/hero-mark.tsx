"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { LogoMark } from "@/components/site/logo";
import { EASE_PREMIUM } from "@/lib/motion";

/**
 * Hero-only wrapper around `LogoMark` — kept separate from `LogoMark` itself
 * so the nav/footer wordmark stays static; this is a hero treatment, not
 * something that belongs on every logo instance site-wide. Layers, outer to
 * inner: a one-time entrance (fade + rise), a slow perpetual float so the
 * mark reads as alive, a pointer-tracked 3D tilt for depth on hover, and a
 * diagonal shine sweep that loops across the poster like a light catching
 * glass. The tilt is direct pointer feedback so it's left unconditional;
 * the float and shine are ambient loops but modest enough (±10px, one
 * sweep per few seconds) that they're kept unconditional too rather than
 * flattened to a near-static crossfade.
 */
export function HeroMark({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springConfig = { stiffness: 200, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-12, 12]), springConfig);
  const glowX = useTransform(pointerX, [0, 1], ["20%", "80%"]);
  const glowY = useTransform(pointerY, [0, 1], ["20%", "80%"]);

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((e.clientX - rect.left) / rect.width);
    pointerY.set((e.clientY - rect.top) / rect.height);
  }

  function handlePointerLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.94, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_PREMIUM }}
    >
      <motion.div
        className="h-full w-full"
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 4.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
          delay: 0.6,
        }}
      >
        <motion.div
          ref={ref}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative h-full w-full [perspective:1000px]"
        >
          {/* pointer-following glow, sits behind the mark */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-2xl"
            style={{
              background: useTransform(
                [glowX, glowY],
                ([x, y]) =>
                  `radial-gradient(closest-side, color-mix(in oklch, var(--primary), transparent 78%) ${x} ${y}, transparent)`
              ),
            }}
          />

          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative h-full w-full overflow-hidden rounded-md"
          >
            <LogoMark
              className="h-full w-full"
              sizes="(min-width: 1024px) 480px, (min-width: 640px) 400px, 320px"
              quality={100}
            />

            {/* diagonal shine sweep, looping */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent"
              animate={{ x: ["-120%", "220%"] }}
              transition={{
                duration: 2.6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3.4,
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
