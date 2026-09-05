"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateRegistrationStatus, updateRegistrationParticipant } from "@/lib/actions/registrations";
import type { Registration, RegistrationStatus, ParticipantInfo } from "@/types/models";

const STATUSES: RegistrationStatus[] = ["pending", "approved", "rejected", "waitlisted"];

function formatResponse(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

export function RegistrationDetailSheet({
  registration,
  open,
  onOpenChange,
}: {
  registration: Registration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draftPerson, setDraftPerson] = useState<ParticipantInfo | null>(null);

  if (!registration) return null;

  const person = registration.registrationType === "team" ? registration.team!.leader : registration.individual!;
  const current = draftPerson ?? person;

  function changeStatus(status: RegistrationStatus) {
    startTransition(async () => {
      const result = await updateRegistrationStatus(registration!.id, status);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Status updated.");
        router.refresh();
      }
    });
  }

  function saveEdit() {
    if (!draftPerson) return setEditing(false);
    startTransition(async () => {
      const result = await updateRegistrationParticipant(
        registration!.id,
        registration!.registrationType === "team" ? { leader: draftPerson } : { individual: draftPerson }
      );
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Registration updated.");
        setEditing(false);
        setDraftPerson(null);
        router.refresh();
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{registration.registrationType === "team" ? registration.team!.teamName : person.name}</SheetTitle>
          <SheetDescription>
            {registration.registrationType === "team" ? "Team registration" : "Individual registration"} · Submitted{" "}
            {new Date(registration.submittedAt).toLocaleString("en-IN")}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-4">
          <div className="flex items-center justify-between">
            <Label>Status</Label>
            <Select value={registration.status} onValueChange={(v) => changeStatus(v as RegistrationStatus)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {registration.registrationType === "team" ? "Team leader" : "Participant"}
              </h3>
              {!editing && (
                <Button variant="ghost" size="icon-sm" onClick={() => { setDraftPerson(person); setEditing(true); }}>
                  <Pencil className="size-3.5" />
                </Button>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                {(["name", "email", "phone", "department", "year"] as const).map((key) => (
                  <div key={key}>
                    <Label className="capitalize">{key}</Label>
                    <Input
                      value={current[key]}
                      onChange={(e) => setDraftPerson({ ...current, [key]: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button size="sm" disabled={isPending} onClick={saveEdit}>
                    {isPending && <Loader2 className="size-3.5 animate-spin" />}
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditing(false); setDraftPerson(null); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <dl className="space-y-1.5 text-sm">
                <Row label="Name" value={person.name} />
                <Row label="Email" value={person.email} />
                <Row label="Phone" value={person.phone} />
                <Row label="Department" value={person.department} />
                <Row label="Year" value={person.year} />
              </dl>
            )}
          </div>

          {registration.registrationType === "team" && (
            <div>
              <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Team members ({registration.team!.members.length})
              </h3>
              <div className="space-y-3">
                {registration.team!.members.map((member, i) => (
                  <dl key={i} className="space-y-1 rounded-lg border border-border p-3 text-sm">
                    <Row label="Name" value={member.name} />
                    <Row label="Email" value={member.email} />
                    <Row label="Phone" value={member.phone} />
                    <Row label="Department" value={member.department} />
                    <Row label="Year" value={member.year} />
                  </dl>
                ))}
              </div>
            </div>
          )}

          {registration.formSnapshot.length > 0 && (
            <div>
              <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Form responses
              </h3>
              <dl className="space-y-1.5 text-sm">
                {registration.formSnapshot.map((field) => (
                  <Row key={field.key} label={field.label} value={formatResponse(registration.responses[field.key])} />
                ))}
              </dl>
            </div>
          )}
        </div>

        <SheetFooter>
          <Badge variant="secondary" className="w-fit">
            v{registration.formVersion}
          </Badge>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}
