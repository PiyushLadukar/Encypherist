import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { getProjectById } from "@/lib/data/projects";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Edit project</h1>
      <div className="mt-8">
        <ProjectForm project={project} />
      </div>
    </div>
  );
}
