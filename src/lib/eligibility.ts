import type { EligibilityConfig } from "@/types/models";
import { ORG } from "@/lib/constants";

/** Human-readable summary shown on the public event page and in admin tables. */
export function eligibilitySummary(eligibility: EligibilityConfig): string {
  const parts: string[] = [];

  parts.push(eligibility.audience === "college_only" ? `${ORG.collegeShort} students only` : "Open to everyone");

  if (eligibility.departments !== "all") {
    parts.push(`Departments: ${eligibility.departments.join(", ")}`);
  }
  if (eligibility.years !== "all") {
    parts.push(`Years: ${eligibility.years.join(", ")}`);
  }
  if (eligibility.semesters !== "all") {
    parts.push(`Semesters: ${eligibility.semesters.join(", ")}`);
  }

  return parts.join(" · ");
}
