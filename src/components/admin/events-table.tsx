"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Eye, Pencil, Users, Archive, ArchiveRestore, Send, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EventStatusBadge } from "@/components/admin/event-status-badge";
import { setEventStatus, deleteEvent } from "@/lib/actions/events";
import type { Event } from "@/types/models";

export function EventsTable({ events }: { events: Event[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function runStatusChange(id: string, status: "published" | "archived" | "draft") {
    startTransition(async () => {
      const result = await setEventStatus(id, status);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success(status === "published" ? "Event published." : status === "archived" ? "Event archived." : "Event moved to draft.");
        router.refresh();
      }
    });
  }

  function runDelete(id: string) {
    startTransition(async () => {
      const result = await deleteEvent(id);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Event deleted.");
        router.refresh();
      }
      setConfirmDeleteId(null);
    });
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No events found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="max-w-[220px] truncate font-medium text-foreground">{event.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {event.startDate ? new Date(event.startDate).toLocaleDateString("en-IN") : "TBA"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString("en-IN") : "—"}
              </TableCell>
              <TableCell className="capitalize text-muted-foreground">{event.registration.type}</TableCell>
              <TableCell>
                <EventStatusBadge event={event} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {event.status === "published" && (
                      <DropdownMenuItem render={<Link href={`/events/${event.slug}`} target="_blank" />}>
                        <Eye /> View public page
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem render={<Link href={`/admin/events/${event.id}/edit`} />}>
                      <Pencil /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href={`/admin/events/${event.id}/participants`} />}>
                      <Users /> Manage participants
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {event.status !== "published" && (
                      <DropdownMenuItem disabled={isPending} onClick={() => runStatusChange(event.id, "published")}>
                        <Send /> Publish
                      </DropdownMenuItem>
                    )}
                    {event.status !== "archived" ? (
                      <DropdownMenuItem disabled={isPending} onClick={() => runStatusChange(event.id, "archived")}>
                        <Archive /> Archive
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem disabled={isPending} onClick={() => runStatusChange(event.id, "draft")}>
                        <ArchiveRestore /> Restore to draft
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem variant="destructive" onClick={() => setConfirmDeleteId(event.id)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the event. Events with existing registrations can&apos;t be deleted — archive
              them instead to preserve participant history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={() => confirmDeleteId && runDelete(confirmDeleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
