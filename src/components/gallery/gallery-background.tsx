"use client";

import { useMemo } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Rounds to 2dp before stringifying into the path — trig results can differ
 * in the last few bits between the server's and the browser's JS engine,
 * which otherwise produces a (visually meaningless) SSR/hydration mismatch.
 */
function r2(n: number) {
  return Math.round(n * 100) / 100;
}

/** One organic bezier line within a ribbon mesh — `t` (0..1) is this line's position across the bundle. */
function ribbonPath(t: number, seed: number, width: number, spread: number, baseY: number) {
  const centerBias = Math.sin(t * Math.PI); // fuller curve toward the middle of the bundle, tapering at the edges
  const amp = spread * (0.28 + centerBias * 0.72);
  const y0 = baseY + t * spread * 0.5;
  const p = seed + t * 3.4;
  const y1 = y0 - amp * Math.sin(p * 1.1 + 0.4);
  const y2 = y0 + amp * Math.sin(p * 0.7 + 1.8);
  const y3 = y0 - amp * 0.6 * Math.sin(p * 1.5 + 3.2);
  const y4 = y0 + amp * 0.45 * Math.sin(p * 0.9 + 4.7);
  const yEnd = y0 + amp * 0.15 * Math.sin(p * 2.1);
  const s = width / 4;
  return `M ${r2(-s * 0.5)},${r2(y0)} C ${r2(s * 0.7)},${r2(y1)} ${r2(s * 1.4)},${r2(y2)} ${r2(s * 2.1)},${r2(y3)} S ${r2(s * 3.3)},${r2(y4)} ${r2(s * 4)},${r2(yEnd)}`;
}

/**
 * A bundle of ~10 thin, related flow-lines (a "ribbon mesh") rather than a
 * single thread — reads as a woven signal rather than a generic decorative
 * squiggle. Center lines of the bundle are slightly more visible than the
 * edges, echoing how the reference image's mesh feels denser in the middle.
 */
function RibbonMesh({
  lineCount,
  seed,
  width,
  height,
  spread,
  baseOpacity,
  className,
  driftDuration,
  driftKeyframes,
  parallaxRange,
  scrollY,
  reduceMotion,
}: {
  lineCount: number;
  seed: number;
  width: number;
  height: number;
  spread: number;
  baseOpacity: number;
  className: string;
  driftDuration: number;
  driftKeyframes: { x: number[]; y: number[]; rotate: number[] };
  parallaxRange: [number, number];
  scrollY: ReturnType<typeof useScroll>["scrollY"];
  reduceMotion: boolean;
}) {
  const paths = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => {
      const t = lineCount <= 1 ? 0.5 : i / (lineCount - 1);
      const centerBias = Math.sin(t * Math.PI);
      return {
        d: ribbonPath(t, seed, width, spread, height * 0.4),
        opacity: Math.round(baseOpacity * (0.35 + centerBias * 0.85) * 1000) / 1000,
      };
    });
  }, [lineCount, seed, width, spread, height, baseOpacity]);

  const parallaxY = useTransform(scrollY, [0, 2400], [0, reduceMotion ? 0 : parallaxRange[1]]);
  const parallaxX = useTransform(scrollY, [0, 2400], [0, reduceMotion ? 0 : parallaxRange[0]]);

  return (
    <motion.div style={{ y: parallaxY, x: parallaxX }} className={className}>
      <motion.div
        animate={reduceMotion ? undefined : { x: driftKeyframes.x, y: driftKeyframes.y, rotate: driftKeyframes.rotate }}
        transition={{ duration: driftDuration, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" fill="none" aria-hidden="true">
          {paths.map((p, i) => (
            <path key={i} d={p.d} stroke="var(--primary)" strokeOpacity={p.opacity} strokeWidth="1" strokeLinecap="round" />
          ))}
        </svg>
      </motion.div>
    </motion.div>
  );
}

/** A soft, standalone pulsing glow — not tied to a specific line, a quiet point of light near the mesh. */
function SoftGlow({ className, delay, reduceMotion }: { className: string; delay: number; reduceMotion: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      initial={{ opacity: 0.15 }}
      animate={reduceMotion ? undefined : { opacity: [0.12, 0.32, 0.12], scale: [1, 1.15, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
      style={{
        background: "radial-gradient(circle, color-mix(in oklch, var(--primary), transparent 55%) 0%, transparent 70%)",
        filter: "blur(6px)",
      }}
    />
  );
}

/** A faint constellation — a handful of nodes with a couple of connecting hairlines, static and very quiet. */
function Constellation({ className }: { className: string }) {
  const nodes = [
    { x: 40, y: 30 },
    { x: 140, y: 70 },
    { x: 90, y: 140 },
    { x: 210, y: 130 },
    { x: 260, y: 40 },
    { x: 175, y: 190 },
  ];
  const links: [number, number][] = [
    [0, 1],
    [1, 3],
    [2, 3],
    [3, 4],
    [2, 5],
  ];

  return (
    <svg viewBox="0 0 300 220" className={className} fill="none" aria-hidden="true">
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="var(--primary)"
          strokeOpacity={0.08}
          strokeWidth="1"
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="1.6" fill="var(--primary)" opacity="0.28" />
      ))}
    </svg>
  );
}

/**
 * Whole-page decorative layer for /gallery only: a faint dot grid, two
 * ribbon meshes (many related flow-lines rather than single threads) drifting
 * at different speeds/directions with scroll-linked parallax layered on top,
 * a couple of soft pulsing glow points, and one quiet constellation cluster.
 * Strictly background — pointer-events-none, absolutely positioned to fill
 * the page's own `relative` root (not `fixed`, so it scrolls in sync with
 * the page rather than fighting the route's PageTransition transform, which
 * would otherwise become its containing block).
 */
export function GalleryBackground() {
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollY } = useScroll();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(var(--foreground) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <RibbonMesh
        lineCount={12}
        seed={1.7}
        width={1440}
        height={420}
        spread={130}
        baseOpacity={0.13}
        className="absolute -right-[8%] top-[0%] w-[85%] min-w-[30rem]"
        driftDuration={80}
        driftKeyframes={{ x: [0, 22, -10, 0], y: [0, -12, 8, 0], rotate: [0, 0.6, -0.4, 0] }}
        parallaxRange={[-16, -60]}
        scrollY={scrollY}
        reduceMotion={reduceMotion}
      />

      <RibbonMesh
        lineCount={9}
        seed={9.3}
        width={1440}
        height={360}
        spread={100}
        baseOpacity={0.08}
        className="absolute -left-[10%] top-[16%] w-[62%] min-w-[24rem]"
        driftDuration={88}
        driftKeyframes={{ x: [0, -16, 10, 0], y: [0, 9, -7, 0], rotate: [0, -0.4, 0.5, 0] }}
        parallaxRange={[10, 34]}
        scrollY={scrollY}
        reduceMotion={reduceMotion}
      />

      <RibbonMesh
        lineCount={10}
        seed={4.2}
        width={1440}
        height={380}
        spread={105}
        baseOpacity={0.09}
        className="absolute -left-[6%] top-[44%] w-[78%] min-w-[26rem]"
        driftDuration={104}
        driftKeyframes={{ x: [0, -18, 12, 0], y: [0, 10, -9, 0], rotate: [0, -0.5, 0.7, 0] }}
        parallaxRange={[14, 40]}
        scrollY={scrollY}
        reduceMotion={reduceMotion}
      />

      <RibbonMesh
        lineCount={9}
        seed={12.6}
        width={1440}
        height={360}
        spread={95}
        baseOpacity={0.075}
        className="absolute -right-[10%] top-[62%] w-[70%] min-w-[24rem]"
        driftDuration={72}
        driftKeyframes={{ x: [0, 18, -12, 0], y: [0, -10, 7, 0], rotate: [0, 0.5, -0.5, 0] }}
        parallaxRange={[-12, -36]}
        scrollY={scrollY}
        reduceMotion={reduceMotion}
      />

      <RibbonMesh
        lineCount={8}
        seed={7.1}
        width={1440}
        height={360}
        spread={90}
        baseOpacity={0.07}
        className="absolute -right-[6%] top-[82%] w-[62%] min-w-[22rem]"
        driftDuration={64}
        driftKeyframes={{ x: [0, 16, -14, 0], y: [0, -8, 11, 0], rotate: [0, 0.5, -0.6, 0] }}
        parallaxRange={[-10, -30]}
        scrollY={scrollY}
        reduceMotion={reduceMotion}
      />

      <SoftGlow className="absolute right-[18%] top-[10%] size-20 rounded-full" delay={0} reduceMotion={reduceMotion} />
      <SoftGlow className="absolute left-[12%] top-[36%] size-14 rounded-full" delay={2.4} reduceMotion={reduceMotion} />
      <SoftGlow className="absolute left-[8%] top-[58%] size-12 rounded-full" delay={4.8} reduceMotion={reduceMotion} />
      <SoftGlow className="absolute right-[14%] top-[76%] size-14 rounded-full" delay={1.6} reduceMotion={reduceMotion} />

      <Constellation className="absolute right-[4%] top-[6%] h-auto w-64 opacity-90" />
      <Constellation className="absolute left-[2%] top-[60%] h-auto w-56 -scale-x-100 opacity-70" />
    </div>
  );
}
