"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RegistrationStatusBadge } from "./registration-status-badge";
import { RegistrationDetailSheet } from "./registration-detail-sheet";
import type { Registration } from "@/types/models";

export function TeamsTable({ teams }: { teams: Registration[] }) {
  const [selected, setSelected] = useState<Registration | null>(null);

  if (teams.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No team registrations yet.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team name</TableHead>
            <TableHead>Team leader</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Registration date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((reg) => (
            <TableRow key={reg.id} className="cursor-pointer" onClick={() => setSelected(reg)}>
              <TableCell className="font-medium text-foreground">{reg.team!.teamName}</TableCell>
              <TableCell className="text-muted-foreground">
                {reg.team!.leader.name} ({reg.team!.leader.email})
              </TableCell>
              <TableCell className="text-muted-foreground">{1 + reg.team!.members.length}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(reg.submittedAt).toLocaleDateString("en-IN")}
              </TableCell>
              <TableCell>
                <RegistrationStatusBadge status={reg.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <RegistrationDetailSheet
        registration={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
