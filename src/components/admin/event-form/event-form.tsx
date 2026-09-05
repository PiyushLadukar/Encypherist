"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BasicDetailsSection, type BasicDetails } from "./basic-details-section";
import { RegistrationSettingsSection } from "./registration-settings-section";
import { EligibilitySection } from "./eligibility-section";
import { FormBuilderSection } from "./form-builder-section";
import { PublishSection } from "./publish-section";
import { createEvent, updateEvent } from "@/lib/actions/events";
import { eventSchema } from "@/lib/validation/event";
import type { Event, EligibilityConfig, RegistrationSettings, FormField, EventPublicationStatus } from "@/types/models";

function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

function toDatetimeLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({ initialEvent }: { initialEvent: Event | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const eventId = initialEvent?.id ?? null;
  const [status, setStatus] = useState<EventPublicationStatus>(initialEvent?.status ?? "draft");
  const [posterUrl, setPosterUrl] = useState<string | null>(initialEvent?.posterUrl ?? null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialEvent));

  const [basic, setBasic] = useState<BasicDetails>({
    name: initialEvent?.name ?? "",
    slug: initialEvent?.slug ?? "",
    description: initialEvent?.description ?? "",
    startDate: toDateInput(initialEvent?.startDate ?? null),
    startTime: initialEvent?.startTime ?? "",
    endDate: toDateInput(initialEvent?.endDate ?? null),
    endTime: initialEvent?.endTime ?? "",
    venue: initialEvent?.venue ?? "",
    coordinator: initialEvent?.coordinator ?? { name: "", email: "", phone: "" },
  });
  const [registrationEnabled, setRegistrationEnabled] = useState(initialEvent?.registrationEnabled ?? false);
  const [registrationDeadline, setRegistrationDeadline] = useState(
    toDatetimeLocalInput(initialEvent?.registrationDeadline ?? null)
  );
  const [registration, setRegistration] = useState<RegistrationSettings>(
    initialEvent?.registration ?? { type: "individual", teamSize: null }
  );
  const [eligibility, setEligibility] = useState<EligibilityConfig>(
    initialEvent?.eligibility ?? { audience: "everyone", departments: "all", years: "all", semesters: "all" }
  );
  const [fields, setFields] = useState<FormField[]>(initialEvent?.registrationForm.fields ?? []);

  // PublishSection changes status via its own server action + router.refresh(),
  // which re-fetches initialEvent from the server with a new status — resync
  // local state during render (React's documented pattern for adjusting state
  // when a prop changes) so a subsequent Save doesn't silently revert it.
  const [prevInitialStatus, setPrevInitialStatus] = useState(initialEvent?.status);
  if (initialEvent && initialEvent.status !== prevInitialStatus) {
    setPrevInitialStatus(initialEvent.status);
    setStatus(initialEvent.status);
  }

  function handleSave() {
    const payload = {
      slug: basic.slug,
      name: basic.name,
      description: basic.description,
      startDate: basic.startDate,
      startTime: basic.startTime,
      endDate: basic.endDate,
      endTime: basic.endTime,
      venue: basic.venue,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : "",
      coordinator: basic.coordinator,
      registrationEnabled,
      eligibility,
      registration,
      registrationForm: { version: initialEvent?.registrationForm.version ?? 1, fields },
      status,
    };

    const parsed = eventSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form for errors.");
      return;
    }

    startTransition(async () => {
      if (eventId) {
        const result = await updateEvent(eventId, parsed.data);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Event saved.");
        router.refresh();
      } else {
        const result = await createEvent(parsed.data);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Event created — upload a poster and publish when ready.");
        router.push(`/admin/events/${result.data.id}/edit`);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {initialEvent ? "Edit event" : "Create event"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure everything about this event from one place.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save
        </Button>
      </div>

      <Tabs defaultValue="basic">
        <TabsList variant="line">
          <TabsTrigger value="basic">Basic Details</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="form">Registration Form</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicDetailsSection
            value={basic}
            onChange={setBasic}
            slugManuallyEdited={slugManuallyEdited}
            onSlugManuallyEditedChange={setSlugManuallyEdited}
            eventId={eventId}
            posterUrl={posterUrl}
            onPosterUploaded={setPosterUrl}
          />
        </TabsContent>

        <TabsContent value="registration" className="mt-6">
          <RegistrationSettingsSection
            value={registration}
            onChange={setRegistration}
            registrationEnabled={registrationEnabled}
            onRegistrationEnabledChange={setRegistrationEnabled}
            registrationDeadline={registrationDeadline}
            onRegistrationDeadlineChange={setRegistrationDeadline}
          />
        </TabsContent>

        <TabsContent value="eligibility" className="mt-6">
          <EligibilitySection value={eligibility} onChange={setEligibility} />
        </TabsContent>

        <TabsContent value="form" className="mt-6">
          <FormBuilderSection fields={fields} onChange={setFields} />
        </TabsContent>

        <TabsContent value="publish" className="mt-6">
          <PublishSection eventId={eventId} currentStatus={status} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
