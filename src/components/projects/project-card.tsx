import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ConfidenceBadge } from "@/components/site/confidence-badge";
import { projectStatusLabel, projectNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/database";

const STATUS_COLOR: Record<Project["status"], string> = {
  active: "text-primary border-primary/30 bg-primary/10",
  deployed: "text-primary border-primary/30 bg-primary/10",
  in_development: "text-signal border-signal/30 bg-signal/10",
  archived: "text-muted-foreground border-border bg-muted",
};

export function ProjectCard({
  project,
  index,
  className,
}: {
  project: Project;
  index: number;
  className?: string;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group flex flex-col justify-between border border-border p-6 transition-colors hover:border-primary/40 sm:p-8",
        className
      )}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-border pb-4">
          <span className="font-mono text-xs text-primary">{`// ${projectNumber(index)}`}</span>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
              STATUS_COLOR[project.status]
            )}
          >
            STATUS: {projectStatusLabel(project.status)}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <h3 className="font-heading text-2xl font-semibold text-foreground transition-colors group-hover:text-primary sm:text-3xl">
            {project.name}
          </h3>
          <ConfidenceBadge confidence={project.confidence} />
        </div>
        <span className="mt-3 block h-0.5 w-10 bg-signal" />

        {project.summary && (
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {project.summary}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        {project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        <span className="inline-flex items-center gap-1 font-mono text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
