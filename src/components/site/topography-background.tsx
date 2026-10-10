"use client";

import React from "react";
import { Topography, useScrollZoom } from "@/components/site/topography";

export function TopographyBackground() {
  const bgScale = useScrollZoom({ minScale: 1.0, maxScale: 2.5, lerpFactor: 0.08 });

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <Topography
        scale={bgScale}
        lowColor="#707bfb"
        midColor="#9bb2fb"
        highColor="#d0dcfe"
        opacity={0.36}
        contrast={1.1}
        brightness={1.0}
        speed={0.14}
        morphAmount={1.2}
        morphSpeed={0.06}
        bands={3.0}
        thickness={0.018}
        glow={0.02}
        mouseInteraction={true}
      />
    </div>
  );
}

