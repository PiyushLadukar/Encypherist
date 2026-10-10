"use client";

import React, { useState, useEffect, useRef } from "react";

// Helper to convert Hex color strings to Normalized RGB [0..1] array
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const vertexShaderSource = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uMorphAmount;
uniform float uBands;
uniform float uThickness;
uniform float uScale;
uniform float uGlow;
uniform float uContrast;
uniform float uBrightness;
uniform float uOpacity;
uniform float uLightMode;
uniform vec3 uLow;
uniform vec3 uMid;
uniform vec3 uHigh;
uniform vec2 uMouse;
uniform float uMouseEnabled;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseActive;
uniform float uGrain;
uniform vec4 uCtrlA;
uniform vec4 uCtrlB;
uniform vec4 uCtrlC;
uniform vec4 uCtrlD;
out vec4 fragColor;

float bez(float t, vec4 c) {
  float w = 6.2831853 * t;
  return 0.5 * (c.x * sin(w) + c.y * cos(w) + c.z * sin(2.0 * w) + c.w * cos(2.0 * w));
}

float field(vec2 uv) {
  vec2 a = vec2(bez(uv.x, uCtrlA), bez(uv.x, uCtrlB));
  vec2 b = vec2(bez(uv.y, uCtrlC), bez(uv.y, uCtrlD));
  return distance(a, b);
}

vec3 elevationColor(float e) {
  vec3 c = mix(uLow, uMid, smoothstep(0.0, 0.5, e));
  return mix(c, uHigh, smoothstep(0.5, 1.0, e));
}

void main() {
  vec2 res = iResolution.xy;
  vec2 uv = gl_FragCoord.xy / res;

  // Zoom scale transform centered at viewport (0.5, 0.5)
  vec2 sampleUv = (uv - 0.5) / max(uScale, 0.001) + 0.5;

  float fv = field(sampleUv);

  // Interactive cursor displacement warp
  if (uMouseEnabled > 0.5) {
    vec2 d = uv - uMouse;
    d.x *= res.x / max(res.y, 1.0);
    float r = max(uMouseRadius, 0.001);
    float bump = exp(-dot(d, d) / (r * r)) * uMouseStrength * uMouseActive;
    fv += bump;
  }

  float f = fv * uBands;
  float frac = fract(f);
  float lineDist = min(frac, 1.0 - frac);

  float aa = fwidth(f) + 0.0001;
  float mask = 1.0 - smoothstep(uThickness - aa, uThickness + aa, lineDist);
  float glowR = uThickness + uGlow * 0.5 + aa;
  float glow = (1.0 - smoothstep(uThickness, glowR, lineDist)) * step(0.0001, uGlow);

  float elev = clamp(fv / (uMorphAmount * 2.5 + 0.001), 0.0, 1.0);
  vec3 lineCol = elevationColor(elev);

  // Subtle island fill for topographic elevation centers (matching clean reference)
  float islandFill = smoothstep(0.72, 0.95, elev) * 0.18;

  float coverage = clamp(mask + glow * 0.55 + islandFill, 0.0, 1.0);
  coverage = pow(coverage, max(uContrast, 0.001));

  vec3 outColor = lineCol * uBrightness;
  float outAlpha = coverage;

  if (uGrain > 0.5) {
    float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453);
    outAlpha += (g - 0.5) * 0.04;
  }

  float a = clamp(outAlpha, 0.0, 1.0) * uOpacity;
  fragColor = vec4(outColor * a, a);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program linking error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

const CTRL_INDICES = [
  [1, -2, 3, -4],
  [9, -8, 7, -6],
  [5, 2, 5, -5],
  [-1, -3, 8, 9],
];

export interface TopographyProps {
  scale?: number;
  lowColor?: string;
  midColor?: string;
  highColor?: string;
  speed?: number;
  morphAmount?: number;
  morphSpeed?: number;
  bands?: number;
  thickness?: number;
  glow?: number;
  contrast?: number;
  brightness?: number;
  opacity?: number;
  lightMode?: boolean;
  mouseInteraction?: boolean;
  className?: string;
}

export const Topography: React.FC<TopographyProps> = ({
  scale = 1.0,
  lowColor = "#707bfb",
  midColor = "#9bb2fb",
  highColor = "#d0dcfe",
  speed = 0.14,
  morphAmount = 1.2,
  morphSpeed = 0.06,
  bands = 3.0,
  thickness = 0.018,
  glow = 0.02,
  contrast = 1.1,
  brightness = 1.0,
  opacity = 0.36,
  lightMode = true,
  mouseInteraction = true,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef<TopographyProps>({});
  propsRef.current = {
    scale,
    lowColor,
    midColor,
    highColor,
    speed,
    morphAmount,
    morphSpeed,
    bands,
    thickness,
    glow,
    contrast,
    brightness,
    opacity,
    lightMode,
    mouseInteraction,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    if (!gl) return;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]),
      gl.STATIC_DRAW
    );

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uLocs = {
      iResolution: gl.getUniformLocation(program, "iResolution"),
      iTime: gl.getUniformLocation(program, "iTime"),
      uMorphAmount: gl.getUniformLocation(program, "uMorphAmount"),
      uBands: gl.getUniformLocation(program, "uBands"),
      uThickness: gl.getUniformLocation(program, "uThickness"),
      uScale: gl.getUniformLocation(program, "uScale"),
      uGlow: gl.getUniformLocation(program, "uGlow"),
      uContrast: gl.getUniformLocation(program, "uContrast"),
      uBrightness: gl.getUniformLocation(program, "uBrightness"),
      uOpacity: gl.getUniformLocation(program, "uOpacity"),
      uLightMode: gl.getUniformLocation(program, "uLightMode"),
      uLow: gl.getUniformLocation(program, "uLow"),
      uMid: gl.getUniformLocation(program, "uMid"),
      uHigh: gl.getUniformLocation(program, "uHigh"),
      uMouse: gl.getUniformLocation(program, "uMouse"),
      uMouseEnabled: gl.getUniformLocation(program, "uMouseEnabled"),
      uMouseRadius: gl.getUniformLocation(program, "uMouseRadius"),
      uMouseStrength: gl.getUniformLocation(program, "uMouseStrength"),
      uMouseActive: gl.getUniformLocation(program, "uMouseActive"),
      uGrain: gl.getUniformLocation(program, "uGrain"),
      uCtrlA: gl.getUniformLocation(program, "uCtrlA"),
      uCtrlB: gl.getUniformLocation(program, "uCtrlB"),
      uCtrlC: gl.getUniformLocation(program, "uCtrlC"),
      uCtrlD: gl.getUniformLocation(program, "uCtrlD"),
    };

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    const currentMouse = [0.5, 0.5];
    const targetMouse = [0.5, 0.5];
    let mouseActive = 0;
    let mouseActiveTarget = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse[0] = (e.clientX - rect.left) / rect.width;
      targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
      mouseActiveTarget = 1;
    };
    const onMouseLeave = () => {
      mouseActiveTarget = 0;
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    const ctrlA = new Float32Array(4);
    const ctrlB = new Float32Array(4);
    const ctrlC = new Float32Array(4);
    const ctrlD = new Float32Array(4);
    const ctrls = [ctrlA, ctrlB, ctrlC, ctrlD];

    let raf = 0;
    const t0 = performance.now();

    const loop = (t: number) => {
      const time = (t - t0) * 0.001;
      const p = propsRef.current;

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      for (let g = 0; g < 4; g++) {
        const arr = ctrls[g];
        const idx = CTRL_INDICES[g];
        for (let j = 0; j < 4; j++) {
          const i = idx[j];
          arr[j] = (p.morphAmount ?? 1.5) * Math.sin(time * (p.speed ?? 0.2) * Math.sin(i * (p.morphSpeed ?? 0.08)) + i);
        }
      }

      currentMouse[0] += 0.08 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.08 * (targetMouse[1] - currentMouse[1]);
      mouseActive += 0.08 * (mouseActiveTarget - mouseActive);

      gl.uniform2f(uLocs.iResolution, canvas.width, canvas.height);
      gl.uniform1f(uLocs.iTime, time);
      gl.uniform1f(uLocs.uMorphAmount, p.morphAmount ?? 1.5);
      gl.uniform1f(uLocs.uBands, p.bands ?? 3.0);
      gl.uniform1f(uLocs.uThickness, p.thickness ?? 0.04);
      gl.uniform1f(uLocs.uScale, p.scale ?? 1.0);
      gl.uniform1f(uLocs.uGlow, p.glow ?? 0.3);
      gl.uniform1f(uLocs.uContrast, p.contrast ?? 2.5);
      gl.uniform1f(uLocs.uBrightness, p.brightness ?? 1.0);
      gl.uniform1f(uLocs.uOpacity, p.opacity ?? 0.85);
      gl.uniform1f(uLocs.uLightMode, p.lightMode ? 1.0 : 0.0);
      gl.uniform1f(uLocs.uGrain, 1.0);

      const rgbLow = hexToRgb(p.lowColor ?? "#09090b");
      const rgbMid = hexToRgb(p.midColor ?? "#3f3f46");
      const rgbHigh = hexToRgb(p.highColor ?? "#000000");
      gl.uniform3f(uLocs.uLow, rgbLow[0], rgbLow[1], rgbLow[2]);
      gl.uniform3f(uLocs.uMid, rgbMid[0], rgbMid[1], rgbMid[2]);
      gl.uniform3f(uLocs.uHigh, rgbHigh[0], rgbHigh[1], rgbHigh[2]);

      gl.uniform2f(uLocs.uMouse, currentMouse[0], currentMouse[1]);
      gl.uniform1f(uLocs.uMouseEnabled, p.mouseInteraction ? 1.0 : 0.0);
      gl.uniform1f(uLocs.uMouseRadius, 0.35);
      gl.uniform1f(uLocs.uMouseStrength, 0.45);
      gl.uniform1f(uLocs.uMouseActive, mouseActive);

      gl.uniform4fv(uLocs.uCtrlA, ctrlA);
      gl.uniform4fv(uLocs.uCtrlB, ctrlB);
      gl.uniform4fv(uLocs.uCtrlC, ctrlC);
      gl.uniform4fv(uLocs.uCtrlD, ctrlD);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      try {
        container.removeChild(canvas);
      } catch {}
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden ${className}`.trim()}
    />
  );
};

// Custom React Hook to compute physics linear-interpolated (lerp) scroll zoom scale
export interface UseScrollZoomOptions {
  minScale?: number;
  maxScale?: number;
  lerpFactor?: number;
}

export function useScrollZoom({
  minScale = 1.0,
  maxScale = 2.5,
  lerpFactor = 0.08,
}: UseScrollZoomOptions = {}) {
  const [scale, setScale] = useState(minScale);
  const targetScaleRef = useRef(minScale);
  const currentScaleRef = useRef(minScale);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

      targetScaleRef.current = minScale + progress * (maxScale - minScale);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [minScale, maxScale]);

  useEffect(() => {
    let animId: number;
    const lerpLoop = () => {
      currentScaleRef.current +=
        (targetScaleRef.current - currentScaleRef.current) * lerpFactor;
      setScale(currentScaleRef.current);
      animId = requestAnimationFrame(lerpLoop);
    };
    animId = requestAnimationFrame(lerpLoop);
    return () => cancelAnimationFrame(animId);
  }, [lerpFactor]);

  return scale;
}
