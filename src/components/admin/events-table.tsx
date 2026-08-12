"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye, Loader2 } from "lucide-react";
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
import { formatDateRange, eventTypeLabel } from "@/lib/format";
import type { Event } from "@/types/database";

const STATUS_VARIANT: Record<Event["status"], "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
};

export function EventsTable({ events }: { events: Event[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`"${title}" deleted.`);
        router.refresh();
      } else {
        toast.error("Couldn't delete that event.");
      }
    } catch {
      toast.error("Network error — couldn't delete that event.");
    } finally {
      setDeletingId(null);
    }
  }

  if (events.length === 0) {
    return <p className="mt-8 text-sm text-muted-foreground">No events yet.</p>;
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium text-foreground">{event.title}</TableCell>
              <TableCell className="text-muted-foreground">{eventTypeLabel(event.type)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[event.status]}>{event.status}</Badge>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {formatDateRange(event.start_at, event.end_at)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<a href={`/admin/events/${event.id}/preview`} target="_blank" rel="noopener noreferrer" />}
                    aria-label="Preview"
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/admin/events/${event.id}/edit`} />}
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={<Button variant="ghost" size="icon-sm" aria-label="Delete" />}
                    >
                      {deletingId === event.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete &ldquo;{event.title}&rdquo;?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently deletes the event and its registrations, gallery,
                          FAQs, speakers and organizers. This can&apos;t be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(event.id, event.title)}>
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
