import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/section-heading";
import { ProjectCard } from "@/components/projects/project-card";
import { getPublishedProjects } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Projects — Encypherist",
  description: "Real-world projects built by Encypherist, JIT Nagpur.",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getPublishedProjects().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="// BUILD_LOG"
        title="What we've shipped."
        description="A collection of real-world projects built by the Encypherist community. Focused on learning, building and deploying — not just simulating."
      />

      {projects.length === 0 ? (
        <div className="mt-16 max-w-lg border border-dashed border-border p-8">
          <p className="font-mono text-xs uppercase tracking-wider text-signal">
            STATUS: PIPELINE_EMPTY
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            No public projects have been verified or published yet. Nothing is
            fabricated here — as soon as Encypherist ships something real, it goes
            here, sourced and credited to the people who built it.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
