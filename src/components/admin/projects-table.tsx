"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/database";

const STATUS_VARIANT: Record<Project["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  deployed: "default",
  in_development: "secondary",
  archived: "outline",
};

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`"${name}" deleted.`);
        router.refresh();
      } else {
        toast.error("Couldn't delete that project.");
      }
    } catch {
      toast.error("Network error — couldn't delete that project.");
    } finally {
      setDeletingId(null);
    }
  }

  if (projects.length === 0) {
    return <p className="mt-8 text-sm text-muted-foreground">No projects yet.</p>;
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium text-foreground">{project.name}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[project.status]}>
                  {project.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={project.published ? "default" : "secondary"}>
                  {project.published ? "Published" : "Hidden"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/admin/projects/${project.id}/edit`} />}
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={<Button variant="ghost" size="icon-sm" aria-label="Delete" />}
                    >
                      {deletingId === project.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete &ldquo;{project.name}&rdquo;?</AlertDialogTitle>
                        <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(project.id, project.name)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
