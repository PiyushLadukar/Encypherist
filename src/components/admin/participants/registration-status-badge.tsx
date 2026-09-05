import { Badge } from "@/components/ui/badge";
import type { RegistrationStatus } from "@/types/models";

const VARIANT: Record<RegistrationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  waitlisted: "outline",
};

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <Badge variant={VARIANT[status]} className="capitalize">
      {status}
    </Badge>
  );
}
