import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportButtons({ eventId }: { eventId: string }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" render={<a href={`/api/admin/events/${eventId}/export?format=csv`} />}>
        <Download className="size-3.5" /> Export CSV
      </Button>
      <Button variant="outline" size="sm" render={<a href={`/api/admin/events/${eventId}/export?format=xlsx`} />}>
        <Download className="size-3.5" /> Export Excel
      </Button>
    </div>
  );
}
