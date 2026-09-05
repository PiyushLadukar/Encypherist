"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RegistrationSettings } from "@/types/models";

const MODES = [
  { value: "individual", label: "Individual" },
  { value: "team", label: "Team" },
  { value: "both", label: "Both" },
] as const;

export function RegistrationSettingsSection({
  value,
  onChange,
  registrationEnabled,
  onRegistrationEnabledChange,
  registrationDeadline,
  onRegistrationDeadlineChange,
}: {
  value: RegistrationSettings;
  onChange: (value: RegistrationSettings) => void;
  registrationEnabled: boolean;
  onRegistrationEnabledChange: (value: boolean) => void;
  registrationDeadline: string;
  onRegistrationDeadlineChange: (value: string) => void;
}) {
  const showTeamSize = value.type !== "individual";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Registration open</p>
            <p className="text-xs text-muted-foreground">Turn on once the event is ready to accept sign-ups.</p>
          </div>
          <Switch checked={registrationEnabled} onCheckedChange={onRegistrationEnabledChange} />
        </div>

        <div>
          <Label htmlFor="registration_deadline">Registration deadline</Label>
          <Input
            id="registration_deadline"
            type="datetime-local"
            value={registrationDeadline}
            onChange={(e) => onRegistrationDeadlineChange(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Registration type</Label>
          <div className="mt-2 flex gap-2">
            {MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() =>
                  onChange({
                    type: mode.value,
                    teamSize: mode.value === "individual" ? null : value.teamSize ?? { min: 2, max: 4 },
                  })
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  value.type === mode.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {showTeamSize && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="team_min">Minimum members</Label>
              <Input
                id="team_min"
                type="number"
                min={1}
                value={value.teamSize?.min ?? 2}
                onChange={(e) =>
                  onChange({ ...value, teamSize: { min: Number(e.target.value), max: value.teamSize?.max ?? 4 } })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="team_max">Maximum members</Label>
              <Input
                id="team_max"
                type="number"
                min={1}
                value={value.teamSize?.max ?? 4}
                onChange={(e) =>
                  onChange({ ...value, teamSize: { min: value.teamSize?.min ?? 2, max: Number(e.target.value) } })
                }
                className="mt-1.5"
              />
            </div>
            <p className="col-span-2 text-xs text-muted-foreground">
              Team size includes the leader — e.g. min 2 / max 4 means 1 leader + 1 to 3 members.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
