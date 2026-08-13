"use client";

import { useState } from "react";
import { MemberCard } from "@/components/members/member-card";
import type { Member } from "@/types/database";

/**
 * Continuous right-to-left strip of the full roster (not just core/final
 * year) — pauses on hover so a desktop visitor can actually read a card,
 * and pauses for good on the first click anywhere in the strip so tapping
 * (no hover on touch) doesn't fight the motion while someone's browsing.
 * The track is the member list rendered twice back-to-back and animated
 * exactly -50%, which is what makes the loop seamless.
 */
export function MemberMarquee({ members }: { members: Member[] }) {
  const [paused, setPaused] = useState(false);
  const duration = Math.max(members.length * 4.5, 24);
  const track = [...members, ...members];

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClickCapture={() => setPaused(true)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent sm:w-28" />

      <div
        className="marquee-track flex w-max gap-5 px-4 py-2 sm:px-6 lg:px-8"
        data-paused={paused}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {track.map((member, i) => (
          <div key={`${member.id}-${i}`} aria-hidden={i >= members.length} inert={i >= members.length}>
            <MemberCard member={member} className="w-64 shrink-0 sm:w-72" />
          </div>
        ))}
      </div>
    </div>
  );
}
