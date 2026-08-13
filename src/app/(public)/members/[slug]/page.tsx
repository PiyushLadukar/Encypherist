import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { MemberIdCard } from "@/components/members/member-id-card";
import { Reveal } from "@/components/site/reveal";
import { getMemberBySlug } from "@/lib/data/members";
import { getProjectsByContributorName } from "@/lib/data/projects";

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

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getMemberBySlug(slug).catch(() => null);

  if (!member) notFound();

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

      <Reveal delay={0.05} className="mt-10">
        <MemberIdCard member={member} />
      </Reveal>

      <Reveal delay={0.1} className="mx-auto mt-16 grid max-w-2xl gap-10 sm:grid-cols-[1fr_auto]">
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
      </Reveal>

      {contributedProjects.length > 0 && (
        <Reveal delay={0.15} className="mx-auto mt-12 max-w-2xl">
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
        </Reveal>
      )}
    </div>
  );
}
