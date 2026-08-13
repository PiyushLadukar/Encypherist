import Link from "next/link";
import { initials } from "@/lib/format";
import type { Member } from "@/types/database";

/**
 * A deliberately plain counterpart to `MemberCard` — no hover-expand, no
 * social row, no motion at all. The faculty board calls for a simple
 * roster photo + name + title, not the same interactive treatment as the
 * student roster.
 */
export function FacultyCard({ member }: { member: Member }) {
  return (
    <Link href={`/members/${member.slug}`} className="relative mx-auto block w-full max-w-[220px] pt-3.5">
      <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-primary shadow-sm">
        {member.designation}
      </span>

      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-border bg-black/5 px-2.5 py-1.5">
          <span className="size-1.5 rounded-full bg-signal/70" />
          <span className="size-1.5 rounded-full bg-emerald-400/70" />
          <span className="size-1.5 rounded-full bg-zinc-500/60" />
        </div>

        <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-900">
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={member.name}
              style={{ objectPosition: member.photo_position ?? "center 20%" }}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center font-heading text-3xl font-semibold text-emerald-400">
              {initials(member.name)}
            </div>
          )}
        </div>

        <div className="p-3 text-center">
          <p className="truncate font-heading text-sm font-semibold uppercase tracking-tight text-foreground">
            {member.name}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {member.designation}
          </p>
        </div>
      </div>
    </Link>
  );
}
