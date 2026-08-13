import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 requires every quality value passed to <Image> to be
    // declared here — 75 is the implicit default used where no `quality`
    // prop is given, 90/100 are used for the higher-fidelity logo renders.
    qualities: [75, 90, 100],
  },
};

export default nextConfig;
