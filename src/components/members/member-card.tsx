import Link from "next/link";
import { ConfidenceBadge } from "@/components/site/confidence-badge";
import { initials, memberDomain, memberStatus } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/database";

export function MemberCard({ member, className }: { member: Member; className?: string }) {
  const status = memberStatus(member.team_group);

  return (
    <Link
      href={`/members/${member.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40",
        className
      )}
    >
      {/* terminal-style title strip — our take on an IDE window bar */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-background/60 px-3 py-2">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-signal/70" />
          <span className="size-1.5 rounded-full bg-primary/70" />
          <span className="size-1.5 rounded-full bg-muted-foreground/50" />
        </span>
        <span className="truncate font-mono text-[10px] text-muted-foreground/70">
          ency://member/{member.slug}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
          <span>MEMBER_ID // ENCY-{member.sort_order.toString().padStart(3, "0")}</span>
          <span className={status === "ACTIVE" ? "text-primary" : "text-muted-foreground"}>
            {status}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex size-16 shrink-0 items-center justify-center border border-border bg-secondary font-heading text-xl font-semibold text-primary">
            {initials(member.name)}
            <span className="absolute -inset-px border border-primary/0 transition-colors group-hover:border-primary/40" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-heading text-base font-semibold text-foreground">
              {member.name}
            </p>
            <p className="truncate text-sm text-muted-foreground">{member.designation}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
            {memberDomain(member.designation)} · {member.year_session}
          </span>
          <ConfidenceBadge confidence={member.confidence} />
        </div>
      </div>
    </Link>
  );
}
