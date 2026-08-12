import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Code2, Briefcase, AtSign } from "lucide-react";
import { ConfidenceBadge } from "@/components/site/confidence-badge";
import { getMemberBySlug } from "@/lib/data/members";
import { getProjectsByContributorName } from "@/lib/data/projects";
import { initials, teamGroupLabel, memberDomain, memberStatus } from "@/lib/format";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = await getMemberBySlug(slug).catch(() => null);
  if (!member) return { title: "Member not found — Encypherist" };
  return {
    title: `${member.name} — Encypherist`,
    description: `${member.name}, ${member.designation} at Encypherist, the CSE student forum at JIT Nagpur.`,
  };
}

const SOCIAL_ICONS = {
  instagram: AtSign,
  linkedin: Briefcase,
  github: Code2,
  twitter: AtSign,
} as const;

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getMemberBySlug(slug).catch(() => null);

  if (!member) notFound();

  const socialEntries = Object.entries(member.socials ?? {}).filter(([, url]) => Boolean(url)) as [
    keyof typeof SOCIAL_ICONS,
    string
  ][];

  const contributedProjects = await getProjectsByContributorName(member.name).catch(() => []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <Link
        href="/members"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        All members
      </Link>

      <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
        <div className="group relative size-28 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-zinc-900 shadow-sm transition-all duration-500 hover:border-emerald-400/80 hover:shadow-[0_0_25px_-5px_rgba(52,211,153,0.45)]">
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={member.name}
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex size-full items-center justify-center font-heading text-4xl font-semibold text-emerald-400 transition-transform duration-500 ease-out group-hover:scale-110">
              {initials(member.name)}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              {teamGroupLabel(member.team_group)} · {member.year_session}
            </p>
            <ConfidenceBadge confidence={member.confidence} />
          </div>
          <h1 className="mt-2 text-balance font-heading text-4xl font-semibold tracking-tight text-foreground">
            {member.name}
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">{member.designation}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">
            <span>MEMBER_ID // ENCY-{member.sort_order.toString().padStart(3, "0")}</span>
            <span>DOMAIN // {memberDomain(member.designation)}</span>
            <span
              className={
                memberStatus(member.team_group) === "ACTIVE" ? "text-primary" : "text-muted-foreground"
              }
            >
              STATUS // {memberStatus(member.team_group)}
            </span>
          </div>

          {socialEntries.length > 0 && (
            <div className="mt-5 flex gap-3">
              {socialEntries.map(([platform, url]) => {
                const Icon = SOCIAL_ICONS[platform] ?? AtSign;
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-10 sm:grid-cols-[1fr_auto]">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            About
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {member.bio ?? "Bio not publicly available yet."}
          </p>
        </div>

        {member.skills.length > 0 && (
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Skills
            </h2>
            <div className="mt-3 flex flex-wrap gap-2 sm:max-w-48">
              {member.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-foreground/80"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {contributedProjects.length > 0 && (
        <div className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Projects
          </h2>
          <ul className="mt-3 space-y-2">
            {contributedProjects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="text-sm text-foreground/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {project.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
