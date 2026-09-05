"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { RegistrationStatusBadge } from "./registration-status-badge";
import { RegistrationDetailSheet } from "./registration-detail-sheet";
import { softDeleteRegistration } from "@/lib/actions/registrations";
import type { Registration } from "@/types/models";

export function ParticipantsTable({ registrations }: { registrations: Registration[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Registration | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function runDelete(id: string) {
    startTransition(async () => {
      const result = await softDeleteRegistration(id);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Registration deleted.");
        router.refresh();
      }
      setConfirmDeleteId(null);
    });
  }

  if (registrations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No registrations match these filters.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((reg) => {
            const person = reg.registrationType === "team" ? reg.team!.leader : reg.individual!;
            return (
              <TableRow key={reg.id} className="cursor-pointer" onClick={() => setSelected(reg)}>
                <TableCell className="max-w-[160px] truncate font-medium text-foreground">{person.name}</TableCell>
                <TableCell className="max-w-[180px] truncate text-muted-foreground">{person.email}</TableCell>
                <TableCell className="text-muted-foreground">{person.department}</TableCell>
                <TableCell className="text-muted-foreground">{person.year}</TableCell>
                <TableCell className="max-w-[140px] truncate text-muted-foreground">
                  {reg.registrationType === "team" ? `${reg.team!.teamName} (${1 + reg.team!.members.length})` : "—"}
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">{reg.registrationType}</TableCell>
                <TableCell>
                  <RegistrationStatusBadge status={reg.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(reg.submittedAt).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelected(reg)}>
                        <Eye /> View details
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => setConfirmDeleteId(reg.id)}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <RegistrationDetailSheet
        registration={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />

      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this registration?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from participant lists and exports. It&apos;s a soft delete — the record is kept for
              historical purposes and can be recovered from the database if needed.
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
