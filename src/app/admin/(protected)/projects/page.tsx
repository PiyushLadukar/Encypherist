import Link from "next/link";
import { Plus } from "lucide-react";
import { ProjectsTable } from "@/components/admin/projects-table";
import { getProjects } from "@/lib/data/projects";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 font-mono text-xs text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <Plus className="size-4" />
          New project
        </Link>
      </div>
      <ProjectsTable projects={projects} />
    </div>
  );
}
