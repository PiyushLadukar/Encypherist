import { z } from "zod";
import type { Event, FormField } from "@/types/models";
import { splitFields, deriveParticipant, findIdentityField } from "@/lib/registration-form";

export const participantInfoSchema = z.object({
  name: z.string().trim().min(2, "Enter a full name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{7,15}$/, "Enter a valid phone number"),
  department: z.string().trim().min(1, "Select a department").max(80),
  year: z.string().trim().min(1, "Select a year").max(40),
});

export type ParticipantInfoInput = z.infer<typeof participantInfoSchema>;

function fieldValueSchema(field: FormField): z.ZodTypeAny {
  let schema: z.ZodTypeAny;
  switch (field.type) {
    case "email":
      schema = z.string().trim().toLowerCase().email("Enter a valid email");
      break;
    case "phone":
      schema = z
        .string()
        .trim()
        .regex(/^[+]?[\d\s-]{7,15}$/, "Enter a valid phone number");
      break;
    case "number":
      schema = z.coerce.number().finite();
      break;
    case "url":
      schema = z.string().trim().url("Enter a valid URL");
      break;
    case "checkbox":
      schema = z.boolean();
      break;
    case "multiselect":
      schema = z
        .array(z.string())
        .refine((vals) => vals.every((v) => (field.options ?? []).includes(v)), {
          message: "Invalid selection",
        });
      break;
    case "dropdown":
    case "radio":
      schema = z
        .string()
        .trim()
        .refine((v) => (field.options ?? []).includes(v), { message: "Invalid selection" });
      break;
    case "long_text":
      schema = z.string().trim().max(5000);
      break;
    case "file":
      // Uploaded separately (see /api/uploads); the form submits the resulting path.
      schema = z.string().trim().max(500);
      break;
    case "short_text":
    case "department":
    case "year":
    case "college":
    default:
      schema = z.string().trim().max(500);
      break;
  }

  if (!field.required) {
    schema =
      field.type === "checkbox"
        ? schema.optional()
        : field.type === "multiselect"
          ? (schema as z.ZodArray<z.ZodString>).optional()
          : (schema as z.ZodString).optional().or(z.literal(""));
  } else if (field.type !== "checkbox" && field.type !== "number" && field.type !== "multiselect") {
    schema = (schema as z.ZodString).min(1, `${field.label} is required`);
  }

  return schema;
}

function fieldsObjectSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    shape[field.key] = fieldValueSchema(field);
  }
  return z.object(shape);
}

/**
 * Builds the full submission schema for an event from its live configuration
 * (registration mode, team size bounds, form fields). Used by both the public
 * form component and the API route, so client/server validation can never
 * drift out of sync.
 *
 * Payload shape:
 *  - individual: { registrationType, identity: {<identity field keys>}, responses: {<custom field keys>} }
 *  - team:       { registrationType, team: { teamName, leader, members: [] }, responses }
 *    where leader/members carry only the identity field keys.
 */
export function buildRegistrationSchema(event: Pick<Event, "registration" | "registrationForm">) {
  const { identityFields, customFields } = splitFields(event.registrationForm.fields);
  const identity = fieldsObjectSchema(identityFields);
  const responses = fieldsObjectSchema(customFields);
  const emailField = findIdentityField(event.registrationForm.fields, "email");

  const allowedModes =
    event.registration.type === "both" ? (["individual", "team"] as const) : ([event.registration.type] as const);

  const base = z.object({
    registrationType: z.enum(allowedModes as unknown as [string, ...string[]]),
    responses,
  });

  return base
    .and(
      z.union([
        z.object({
          registrationType: z.literal("individual"),
          identity,
          team: z.undefined().optional(),
        }),
        z.object({
          registrationType: z.literal("team"),
          team: z.object({
            teamName: z.string().trim().min(2, "Enter a team name").max(120),
            leader: identity,
            members: z.array(identity).max(50),
          }),
          identity: z.undefined().optional(),
        }),
      ])
    )
    .superRefine((val, ctx) => {
      if (val.registrationType !== "team") return;
      const teamSize = event.registration.teamSize;
      if (teamSize) {
        const total = 1 + val.team.members.length;
        if (total < teamSize.min || total > teamSize.max) {
          ctx.addIssue({
            code: "custom",
            path: ["team", "members"],
            message:
              teamSize.min === teamSize.max
                ? `Team must have exactly ${teamSize.min} member${teamSize.min === 1 ? "" : "s"} (including the leader)`
                : `Team size must be between ${teamSize.min} and ${teamSize.max} members (including the leader)`,
          });
        }
      }
      if (emailField) {
        const emails = [
          val.team.leader[emailField.key],
          ...val.team.members.map((m: Record<string, unknown>) => m[emailField.key]),
        ].map((e) => String(e ?? "").toLowerCase());
        if (new Set(emails).size !== emails.length) {
          ctx.addIssue({ code: "custom", path: ["team", "members"], message: "Team members must have unique emails" });
        }
      }
    });
}

export type EligibilityCheckResult = { eligible: true } | { eligible: false; reason: string };

/**
 * Server-side (and reused client-side for instant feedback) eligibility gate.
 * Evaluated against the registrant responsible for the submission: the
 * individual applicant, or the team leader for team registrations. An
 * eligibility axis is only enforced when the form still collects the field it
 * needs — if the admin removed the Department or Year field, that axis is skipped.
 */
export function checkEligibility(
  event: Pick<Event, "eligibility" | "registrationForm">,
  participant: Pick<ParticipantInfoInput, "department" | "year">
): EligibilityCheckResult {
  const { departments, years } = event.eligibility;
  const { identityFields } = splitFields(event.registrationForm.fields);
  const collectsDepartment = identityFields.some((f) => f.identity === "department");
  const collectsYear = identityFields.some((f) => f.identity === "year");

  if (collectsDepartment && departments !== "all" && !departments.includes(participant.department)) {
    return { eligible: false, reason: "This event isn't open to your department." };
  }
  if (collectsYear && years !== "all" && !years.includes(participant.year)) {
    return { eligible: false, reason: "This event isn't open to your academic year." };
  }
  return { eligible: true };
}

/** Re-export for consumers that build the participant record from a submission. */
export { deriveParticipant };
