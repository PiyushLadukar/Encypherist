import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/site/confidence-badge";
import { PosterPlaceholder } from "@/components/events/event-card";
import { getProjectBySlug, getPublishedProjects } from "@/lib/data/projects";
import { findPublishedMemberByName } from "@/lib/data/members";
import { projectStatusLabel, projectNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug).catch(() => null);
  if (!project) return { title: "Project not found — Encypherist" };
  return {
    title: `${project.name} — Encypherist`,
    description: project.summary ?? undefined,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug).catch(() => null);

  if (!project) notFound();

  const all = await getPublishedProjects().catch(() => []);
  const index = all.findIndex((p) => p.id === project.id);

  const contributorLinks = await Promise.all(
    project.contributors.map(async (name) => ({
      name,
      member: await findPublishedMemberByName(name).catch(() => null),
    }))
  );

  return (
    <div>
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All projects
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative aspect-[21/9] overflow-hidden border border-border">
          <PosterPlaceholder title={project.name} />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-primary">
            {`// ${projectNumber(index >= 0 ? index : 0)}`}
          </span>
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            STATUS: {projectStatusLabel(project.status)}
          </span>
          <ConfidenceBadge confidence={project.confidence} />
        </div>

        <h1 className="mt-3 text-balance font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {project.name}
        </h1>

        {project.summary && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {project.summary}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {project.link_url && (
            <Button nativeButton={false} render={<a href={project.link_url} target="_blank" rel="noopener noreferrer" />} className="font-mono text-sm">
              Live link
              <ArrowUpRight className="size-4" />
            </Button>
          )}
          {project.repo_url && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<a href={project.repo_url} target="_blank" rel="noopener noreferrer" />}
              className="font-mono text-sm"
            >
              <Code2 className="size-4" />
              Repository
            </Button>
          )}
        </div>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-12">
            {project.problem && (
              <section>
                <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Problem
                </h2>
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                  {project.problem}
                </p>
              </section>
            )}
            {project.solution && (
              <section>
                <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Solution
                </h2>
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                  {project.solution}
                </p>
              </section>
            )}
          </div>

          <aside className="space-y-10">
            {project.tech_stack.length > 0 && (
              <div>
                <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Stack
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-foreground/80"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {contributorLinks.length > 0 && (
              <div>
                <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Team
                </h2>
                <ul className="mt-3 space-y-2">
                  {contributorLinks.map(({ name, member }) =>
                    member ? (
                      <li key={name}>
                        <Link
                          href={`/member/${member.slug}`}
                          className="text-sm text-foreground/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
                        >
                          {name}
                        </Link>
                      </li>
                    ) : (
                      <li key={name} className="text-sm text-foreground/80">
                        {name}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
