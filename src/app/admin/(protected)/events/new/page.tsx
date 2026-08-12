import { EventForm } from "@/components/admin/event-form";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">New event</h1>
      <div className="mt-8">
        <EventForm />
      </div>
    </div>
  );
}
