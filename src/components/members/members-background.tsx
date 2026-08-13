export function MembersBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-black">
      {/* base grid — faint terminal-style lines that slowly drift */}
      <div
        className="absolute inset-0 opacity-[0.15] [animation:grid-pan_40s_linear_infinite]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* floating glow blobs — emerald + neutral, blurred, slow orbit */}
      <div className="absolute left-[8%] top-[10%] size-[28rem] rounded-full bg-emerald-500/20 blur-[110px] [animation:float-a_22s_ease-in-out_infinite]" />
      <div className="absolute right-[5%] top-[35%] size-[24rem] rounded-full bg-emerald-400/10 blur-[100px] [animation:float-b_26s_ease-in-out_infinite]" />
      <div className="absolute bottom-[5%] left-[30%] size-[26rem] rounded-full bg-zinc-500/10 blur-[120px] [animation:float-c_30s_ease-in-out_infinite]" />

      {/* vignette so content near the edges stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_75%,rgba(0,0,0,0.85)_100%)]" />

      <style>{`
        @keyframes grid-pan {
          0% { background-position: 0 0; }
          100% { background-position: 44px 44px; }
        }
        @keyframes float-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(4%, 6%) scale(1.08); }
          66% { transform: translate(-3%, 3%) scale(0.96); }
        }
        @keyframes float-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-6%, 4%) scale(1.1); }
          70% { transform: translate(3%, -5%) scale(0.94); }
        }
        @keyframes float-c {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, -6%) scale(1.06); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"], .grid-pan, div[class*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
