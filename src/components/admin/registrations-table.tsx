"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { RegistrationWithEvent } from "@/lib/data/admin";

export function RegistrationsTable({ registrations }: { registrations: RegistrationWithEvent[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Registration removed.");
        router.refresh();
      } else {
        toast.error("Couldn't remove that registration.");
      }
    } catch {
      toast.error("Network error — couldn't remove that registration.");
    } finally {
      setDeletingId(null);
    }
  }

  if (registrations.length === 0) {
    return <p className="mt-8 text-sm text-muted-foreground">No registrations yet.</p>;
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>College</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium text-foreground">{r.full_name}</TableCell>
              <TableCell className="text-muted-foreground">{r.event_title}</TableCell>
              <TableCell className="text-muted-foreground">{r.email}</TableCell>
              <TableCell className="text-muted-foreground">{r.phone}</TableCell>
              <TableCell className="text-muted-foreground">{r.college}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString("en-IN")}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete registration"
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                >
                  {deletingId === r.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
