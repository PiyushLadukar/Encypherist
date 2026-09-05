"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagMultiSelect } from "@/components/admin/tag-multiselect";
import { SUGGESTED_DEPARTMENTS, ACADEMIC_YEARS, SEMESTERS } from "@/lib/constants/academic";
import { cn } from "@/lib/utils";
import type { EligibilityConfig } from "@/types/models";

function AllOrSpecific({
  label,
  value,
  onChange,
  suggestions,
}: {
  label: string;
  value: string[] | "all";
  onChange: (value: string[] | "all") => void;
  suggestions: readonly string[];
}) {
  const isAll = value === "all";
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            isAll ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => onChange(isAll ? [] : value)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            !isAll ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
          )}
        >
          Specific
        </button>
      </div>
      {!isAll && (
        <div className="mt-3">
          <TagMultiSelect value={value} onChange={onChange} suggestions={suggestions} />
        </div>
      )}
    </div>
  );
}

export function EligibilitySection({
  value,
  onChange,
}: {
  value: EligibilityConfig;
  onChange: (value: EligibilityConfig) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eligibility</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Registration audience</Label>
          <div className="mt-2 flex gap-2">
            {(["everyone", "college_only"] as const).map((audience) => (
              <button
                key={audience}
                type="button"
                onClick={() => onChange({ ...value, audience })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  value.audience === audience
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {audience === "everyone" ? "Open to everyone" : "College students only"}
              </button>
            ))}
          </div>
        </div>

        <AllOrSpecific
          label="Eligible departments"
          value={value.departments}
          onChange={(departments) => onChange({ ...value, departments })}
          suggestions={SUGGESTED_DEPARTMENTS}
        />

        <AllOrSpecific
          label="Eligible academic years"
          value={value.years}
          onChange={(years) => onChange({ ...value, years })}
          suggestions={ACADEMIC_YEARS}
        />

        <AllOrSpecific
          label="Eligible semesters (optional)"
          value={value.semesters}
          onChange={(semesters) => onChange({ ...value, semesters })}
          suggestions={SEMESTERS}
        />
      </CardContent>
    </Card>
  );
}
