export type Principle = {
  number: string;
  title: string;
  tag: string;
  description: string;
  detail: string;
};

/** Shared between the homepage's principles section and /about — single source of truth. */
export const PRINCIPLES: Principle[] = [
  {
    number: "01",
    title: "BUILD",
    tag: "TECHNICAL_LAYER",
    description:
      "Hands-on technical activities — algorithms, UI/UX, Linux & cybersecurity, AI — run by students, for students.",
    detail: "Sense & Simplicity, Hackroot, QuizGen AI",
  },
  {
    number: "02",
    title: "EXPERIMENT",
    tag: "COMPETITIVE_LAYER",
    description:
      "Competitive formats that reward shipping something real over memorizing theory.",
    detail: "Code Craft, Algorithm Arena, Byte Design Pitch",
  },
  {
    number: "03",
    title: "COLLABORATE",
    tag: "COMMUNITY_LAYER",
    description:
      "Outreach and donation drives that put the forum's skills to work outside the department too.",
    detail: "Threads of Future, DISHA",
  },
  {
    number: "04",
    title: "HAND OFF",
    tag: "CONTINUITY_LAYER",
    description:
      "A new council every tenure — final year hands the system to second year, and the build log continues.",
    detail: "2024-25 → 2026-27 and counting",
  },
];
