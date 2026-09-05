import { Card, CardContent } from "@/components/ui/card";

export function ParticipantStatsCards({
  stats,
}: {
  stats: { total: number; pending: number; approved: number; rejected: number; waitlisted: number; teams: number };
}) {
  const cards = [
    { label: "Total Registrations", value: stats.total },
    { label: "Approved", value: stats.approved },
    { label: "Pending", value: stats.pending },
    { label: "Rejected", value: stats.rejected },
    { label: "Waitlisted", value: stats.waitlisted },
    { label: "Teams", value: stats.teams },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex flex-col gap-1">
            <p className="text-xl font-semibold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
