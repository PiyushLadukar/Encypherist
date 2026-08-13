import { ConfidenceBadge } from "@/components/site/confidence-badge";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/site/social-icons";
import { ShareButton } from "@/components/members/share-button";
import { initials, memberDomain, memberStatus, teamGroupLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/database";

const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  github: GithubIcon,
} as const;

/**
 * The member detail page's centerpiece — styled as a physical access badge
 * (title strip, portrait, perforated tear line, barcode stub) rather than a
 * generic profile header, since that's what was asked for: something that
 * reads as "here's my ID card," not "here's a bio page."
 */
const SOCIAL_PLATFORMS = ["instagram", "linkedin", "github"] as const;

export function MemberIdCard({ member }: { member: Member }) {
  const status = memberStatus(member.team_group);

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border-2 border-border bg-card shadow-xl">
      {/* terminal-style title strip — matches MemberCard's IDE-window motif */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-black/5 px-4 py-2.5">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-signal/70" />
          <span className="size-1.5 rounded-full bg-emerald-400/70" />
          <span className="size-1.5 rounded-full bg-zinc-500/60" />
        </span>
        <span className="truncate font-mono text-[10px] text-muted-foreground">
          ency://member/{member.slug}
        </span>
      </div>

      {/* portrait */}
      <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-border bg-zinc-900">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={member.name}
            style={{ objectPosition: member.photo_position ?? "center 20%" }}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center font-heading text-6xl font-semibold text-emerald-400">
            {initials(member.name)}
          </div>
        )}
        <div className="absolute right-3 top-3">
          <ConfidenceBadge confidence={member.confidence} />
        </div>
      </div>

      <div className="p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          {teamGroupLabel(member.team_group)} · {member.year_session}
        </p>
        <h1 className="mt-2 text-balance font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
          {member.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{member.designation}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
          <span>ID // ENCY-{member.sort_order.toString().padStart(3, "0")}</span>
          <span>DOMAIN // {memberDomain(member.designation)}</span>
          <span className={status === "ACTIVE" ? "text-emerald-500" : "text-muted-foreground/70"}>
            STATUS // {status}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {SOCIAL_PLATFORMS.map((platform) => {
            const Icon = SOCIAL_ICONS[platform];
            const url = member.socials?.[platform];
            // Shown even before a link is on file — dimmed and inert until
            // one's added via the admin panel, rather than not existing.
            if (!url) {
              return (
                <span
                  key={platform}
                  aria-label={`${platform} (not set)`}
                  className="flex size-9 items-center justify-center rounded-md border border-border text-foreground opacity-35"
                >
                  <Icon className="size-4" />
                </span>
              );
            }
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform}
                className="flex size-9 items-center justify-center rounded-md border border-border text-foreground transition-all hover:scale-110 hover:border-primary/40"
              >
                <Icon className="size-4" />
              </a>
            );
          })}
          <ShareButton
            title={`${member.name} — Encypherist`}
            text={`${member.name}, ${member.designation} at Encypherist`}
            className="ml-auto"
          />
        </div>
      </div>

      {/* perforated tear line + barcode stub — the "physical ID card" tell */}
      <div className="border-t border-dashed border-border" />
      <div className="flex items-center gap-3 px-6 py-4">
        <div
          aria-hidden="true"
          className={cn(
            "h-7 flex-1 opacity-60",
            "bg-[repeating-linear-gradient(90deg,var(--foreground)_0px,var(--foreground)_1px,transparent_1px,transparent_3px,var(--foreground)_3px,var(--foreground)_5px,transparent_5px,transparent_7px,var(--foreground)_7px,var(--foreground)_8px,transparent_8px,transparent_11px)]"
          )}
        />
        <span className="shrink-0 font-mono text-[9px] tracking-wider text-muted-foreground/60">
          ENCY-{member.sort_order.toString().padStart(3, "0")}
        </span>
      </div>
    </div>
  );
}
