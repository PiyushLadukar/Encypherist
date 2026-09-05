"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setEventStatus } from "@/lib/actions/events";
import type { EventPublicationStatus } from "@/types/models";

export function PublishSection({
  eventId,
  currentStatus,
}: {
  eventId: string | null;
  currentStatus: EventPublicationStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function change(status: EventPublicationStatus) {
    if (!eventId) return;
    startTransition(async () => {
      const result = await setEventStatus(eventId, status);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success(
          status === "published" ? "Event published — it's now live on the public site." : `Event moved to ${status}.`
        );
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Current status</p>
            <p className="text-xs text-muted-foreground">
              Draft events are only visible in this dashboard. Published events appear on the public site.
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {currentStatus}
          </Badge>
        </div>

        {!eventId ? (
          <p className="text-sm text-muted-foreground">Save the event first, then publish it from here.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentStatus !== "published" && (
              <Button type="button" disabled={isPending} onClick={() => change("published")}>
                <Send className="size-3.5" /> Publish
              </Button>
            )}
            {currentStatus === "published" && (
              <Button type="button" variant="outline" disabled={isPending} onClick={() => change("draft")}>
                Unpublish (back to draft)
              </Button>
            )}
            {currentStatus !== "archived" ? (
              <Button type="button" variant="outline" disabled={isPending} onClick={() => change("archived")}>
                <Archive className="size-3.5" /> Archive
              </Button>
            ) : (
              <Button type="button" variant="outline" disabled={isPending} onClick={() => change("draft")}>
                <ArchiveRestore className="size-3.5" /> Restore to draft
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
