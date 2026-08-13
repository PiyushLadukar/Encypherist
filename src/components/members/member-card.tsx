"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ConfidenceBadge } from "@/components/site/confidence-badge";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/site/social-icons";
import { initials, memberDomain, memberStatus } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/database";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  github: GithubIcon,
} as const;

/**
 * Opens a member's social link in a new tab without triggering the card's
 * own click-through to `/members/[slug]` — a plain `<a>` here would nest an
 * anchor inside the card's outer `Link` (invalid HTML, unreliable clicks),
 * so this is a button that opens the URL itself and stops the event before
 * it reaches the card. Always rendered, even before a member has a URL on
 * file — shown dimmed and inert until one's added via the admin panel, so
 * the row reads as "not filled in yet" rather than looking cut off.
 */
function SocialIconButton({
  platform,
  url,
}: {
  platform: keyof typeof SOCIAL_ICONS;
  url?: string;
}) {
  const Icon = SOCIAL_ICONS[platform];
  return (
    <button
      type="button"
      aria-label={platform}
      aria-disabled={!url}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-foreground transition-all",
        url ? "opacity-90 hover:scale-110 hover:opacity-100" : "cursor-default opacity-35"
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}

export function MemberCard({ member, className }: { member: Member; className?: string }) {
  const status = memberStatus(member.team_group);
  const [hovered, setHovered] = useState(false);
  // This expand is a direct, user-initiated hover response rather than
  // autoplaying or scroll-triggered motion, so — unlike the rest of the
  // site's animations — it isn't gated behind prefers-reduced-motion: OS
  // reduced-motion settings target vestibular-triggering effects like
  // parallax and autoplay, not a card responding to the pointer sitting
  // over it.
  const layoutTransition = { duration: 0.55, ease: EASE_PREMIUM };

  return (
    <Link
      href={`/members/${member.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[2rem] border border-zinc-800/80 bg-background transition-all duration-500 ease-out hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-[0_0_40px_-12px_rgba(52,211,153,0.35)]",
        className
      )}
    >
      {/* terminal-style title strip — our take on an IDE window bar */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 bg-black/5 px-3 py-2">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-signal/70" />
          <span className="size-1.5 rounded-full bg-emerald-400/70" />
          <span className="size-1.5 rounded-full bg-zinc-500/60" />
        </span>
        <span
          className={cn(
            "truncate font-mono text-[10px] text-zinc-500 transition-all duration-500",
            hovered && "translate-x-2 opacity-0"
          )}
        >
          ency://member/{member.slug}
        </span>
      </div>

      {/*
        Main content area — the height/position changes below are driven by
        `hovered` state through Motion's `layout` prop instead of a raw CSS
        transition on height/top/left/width. Those box-model properties force
        a browser layout recalculation every frame; `layout` instead measures
        the before/after rect once and animates a transform (translate+scale)
        between them — the same technique as Framer's "magic move" — so the
        expand reads as one continuous, GPU-smooth motion instead of a
        stepped reflow.
      */}
      <motion.div
        layout
        transition={layoutTransition}
        className={cn("relative w-full overflow-hidden p-6", hovered ? "h-[430px]" : "h-[260px]")}
      >
        {/* Top Meta: ID and Status — fades out on hover */}
        <div
          className={cn(
            "flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500 transition-all duration-500",
            hovered && "-translate-y-4 opacity-0"
          )}
        >
          <span>MEMBER_ID // ENCY-{member.sort_order.toString().padStart(3, "0")}</span>
          <span className={status === "ACTIVE" ? "text-emerald-400" : "text-zinc-500"}>
            {status}
          </span>
        </div>

        {/* Photo — small thumbnail at rest, grows to a full passport-style frame on hover */}
        <motion.div
          layout
          transition={layoutTransition}
          className={cn(
            "absolute overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 transition-[border-color,box-shadow,border-radius] duration-500 ease-out dark:border-zinc-800 dark:bg-zinc-900",
            hovered
              ? "top-[24px] left-[24px] h-[280px] w-[calc(100%-48px)] rounded-2xl border-emerald-400/50 shadow-[0_0_20px_-3px_rgba(52,211,153,0.3)]"
              : "top-[80px] left-[24px] h-[100px] w-[80px]"
          )}
        >
          {member.photo_url ? (
            <motion.img
              layout
              src={member.photo_url}
              alt={member.name}
              style={{ objectPosition: member.photo_position ?? "center 20%" }}
              className={cn(
                "size-full object-cover transition-transform duration-500 ease-out",
                hovered && "scale-105"
              )}
            />
          ) : (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-zinc-100 font-heading text-2xl font-semibold text-emerald-500 transition-transform duration-500 ease-out dark:bg-zinc-900/40",
                hovered && "scale-110"
              )}
            >
              {initials(member.name)}
            </div>
          )}
        </motion.div>

        {/* Name and designation — shifts from beside the photo to below it on hover */}
        <motion.div
          layout
          transition={layoutTransition}
          className={cn("absolute right-[24px]", hovered ? "top-[320px] left-[24px]" : "top-[90px] left-[124px]")}
        >
          <p
            className={cn(
              "truncate font-heading font-semibold text-foreground tracking-tight uppercase transition-all duration-500",
              hovered ? "text-xl font-bold" : "text-lg"
            )}
          >
            {member.name}
          </p>
          <p
            className={cn(
              "truncate text-sm text-zinc-500 transition-all duration-500",
              hovered && "mt-1 font-mono text-xs uppercase tracking-wider text-emerald-500"
            )}
          >
            {member.designation}
          </p>
          <div className="mt-3 flex items-center gap-1">
            <SocialIconButton platform="instagram" url={member.socials.instagram} />
            <SocialIconButton platform="linkedin" url={member.socials.linkedin} />
            <SocialIconButton platform="github" url={member.socials.github} />
          </div>
        </motion.div>

        {/* Default footer: domain & confidence — fades out on hover */}
        <div
          className={cn(
            "absolute bottom-[24px] left-[24px] right-[24px] flex items-center justify-between border-t border-zinc-200 pt-3 transition-all duration-500 ease-out dark:border-zinc-800/80",
            hovered && "pointer-events-none translate-y-4 opacity-0"
          )}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {memberDomain(member.designation)} · {member.year_session}
          </span>
          <ConfidenceBadge confidence={member.confidence} />
        </div>
      </motion.div>
    </Link>
  );
}
