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
        <span className="truncate font-mono text-[10px] text-zinc-500 transition-all duration-500 group-hover:opacity-0 group-hover:translate-x-2">
          ency://member/{member.slug}
        </span>
      </div>

      {/* Main Content Area with dynamic height transition */}
      <div className="relative w-full h-[300px] group-hover:h-[430px] p-6 transition-all duration-500 ease-out overflow-hidden">
        
        {/* Top Meta: ID and Status - Fades out on hover */}
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500 transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-4">
          <span>MEMBER_ID // ENCY-{member.sort_order.toString().padStart(3, "0")}</span>
          <span className={status === "ACTIVE" ? "text-emerald-400" : "text-zinc-500"}>
            {status}
          </span>
        </div>

        {/* Photo Container - transitions from small on left to full passport size on hover */}
        <div className="absolute top-[80px] left-[24px] w-[80px] h-[100px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden transition-all duration-500 ease-out group-hover:top-[24px] group-hover:left-[24px] group-hover:w-[calc(100%-48px)] group-hover:h-[280px] group-hover:rounded-2xl group-hover:border-emerald-400/50 group-hover:shadow-[0_0_20px_-3px_rgba(52,211,153,0.3)]">
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={member.name}
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
             <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900/40",
                "font-heading text-2xl font-semibold text-emerald-500 transition-transform duration-500 ease-out group-hover:scale-110"
              )}
            >
              {initials(member.name)}
            </div>
          )}
        </div>

        {/* Name and Designation - Shifts from right of photo to below photo on hover */}
        <div className="absolute top-[90px] left-[124px] right-[24px] transition-all duration-500 ease-out group-hover:top-[320px] group-hover:left-[24px] group-hover:right-[24px]">
          <p className="truncate font-heading text-lg font-semibold text-foreground tracking-tight uppercase group-hover:text-xl group-hover:font-bold">
            {member.name}
          </p>
          <p className="truncate text-sm text-zinc-500 transition-colors duration-500 group-hover:text-emerald-500 group-hover:text-xs group-hover:font-mono group-hover:uppercase group-hover:tracking-wider group-hover:mt-1">
            {member.designation}
          </p>
        </div>

        {/* Default Footer: Domain & Confidence - Fades out on hover */}
        <div className="absolute bottom-[24px] left-[24px] right-[24px] flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/80 pt-3 transition-all duration-500 ease-out group-hover:opacity-0 group-hover:translate-y-4 group-hover:pointer-events-none">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {memberDomain(member.designation)} · {member.year_session}
          </span>
          <ConfidenceBadge confidence={member.confidence} />
        </div>

      </div>
    </Link>
  );
}
