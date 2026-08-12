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
import { teamGroupLabel } from "@/lib/format";
import type { Member } from "@/types/database";

export function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`"${name}" removed.`);
        router.refresh();
      } else {
        toast.error("Couldn't remove that member.");
      }
    } catch {
      toast.error("Network error — couldn't remove that member.");
    } finally {
      setDeletingId(null);
    }
  }

  if (members.length === 0) {
    return <p className="mt-8 text-sm text-muted-foreground">No members yet.</p>;
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium text-foreground">{member.name}</TableCell>
              <TableCell className="text-muted-foreground">{member.designation}</TableCell>
              <TableCell className="text-muted-foreground">{teamGroupLabel(member.team_group)}</TableCell>
              <TableCell>
                <Badge variant={member.published ? "default" : "secondary"}>
                  {member.published ? "Published" : "Hidden"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/admin/members/${member.id}/edit`} />}
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={<Button variant="ghost" size="icon-sm" aria-label="Delete" />}
                    >
                      {deletingId === member.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete &ldquo;{member.name}&rdquo;?</AlertDialogTitle>
                        <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(member.id, member.name)}>
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
