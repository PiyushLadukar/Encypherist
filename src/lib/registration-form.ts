import type {
  FormField,
  FormFieldIdentity,
  ParticipantInfo,
  RegistrationForm,
} from "@/types/models";

/**
 * The five standard participant fields, seeded into every new event's
 * registration form. They are ordinary fields from that point on — the admin
 * can relabel, reorder, make optional, or delete them in the form builder.
 * Their `identity` tag lets the server keep deriving a
 * `{name,email,phone,department,year}` participant record from the answers,
 * which eligibility checks, duplicate detection, participant filters and the
 * CSV/Excel export all rely on.
 */
export const DEFAULT_REGISTRATION_FIELDS: FormField[] = [
  { key: "name", type: "short_text", label: "Full name", required: true, identity: "name", order: 0 },
  { key: "email", type: "email", label: "Email", required: true, identity: "email", order: 1 },
  { key: "phone", type: "phone", label: "Phone", required: true, identity: "phone", order: 2 },
  { key: "department", type: "department", label: "Department", required: true, identity: "department", order: 3 },
  { key: "year", type: "year", label: "Year", required: true, identity: "year", order: 4 },
];

export const IDENTITY_ROLES: FormFieldIdentity[] = ["name", "email", "phone", "department", "year"];

/** Deep-clones the seed so callers can freely renumber `order` etc. */
export function defaultRegistrationFields(): FormField[] {
  return DEFAULT_REGISTRATION_FIELDS.map((f) => ({ ...f }));
}

/** Splits a field list into the identity-tagged fields and the rest, each order-sorted. */
export function splitFields(fields: FormField[]): {
  identityFields: FormField[];
  customFields: FormField[];
} {
  const sorted = [...fields].sort((a, b) => a.order - b.order);
  return {
    identityFields: sorted.filter((f) => f.identity),
    customFields: sorted.filter((f) => !f.identity),
  };
}

export function hasIdentity(fields: FormField[], role: FormFieldIdentity): boolean {
  return fields.some((f) => f.identity === role);
}

export function findIdentityField(fields: FormField[], role: FormFieldIdentity): FormField | undefined {
  return fields.find((f) => f.identity === role);
}

/** True when a form already carries any of the standard identity fields. */
export function formHasIdentityFields(form: Pick<RegistrationForm, "fields">): boolean {
  return form.fields.some((f) => f.identity);
}

/**
 * Brings a pre-existing form (no identity tags) up to the new model: seeds any
 * missing standard field and, where a field already uses a reserved key
 * (`name`, `email`, …), tags that field with the matching identity role
 * instead of adding a duplicate. A no-op once the form has any identity field.
 */
export function mergeIdentityFields(fields: FormField[]): FormField[] {
  if (formHasIdentityFields({ fields })) return fields;

  const existingKeys = new Set(fields.map((f) => f.key));
  const missingSeeds = DEFAULT_REGISTRATION_FIELDS.filter((s) => !existingKeys.has(s.key)).map((s) => ({
    ...s,
  }));

  const promoted = fields.map((f) => {
    const seed = DEFAULT_REGISTRATION_FIELDS.find((s) => s.key === f.key);
    return seed && !f.identity ? { ...f, identity: seed.identity } : f;
  });

  return [...missingSeeds, ...promoted].map((f, i) => ({ ...f, order: i }));
}

/**
 * Rebuilds the `{name,email,phone,department,year}` participant record from the
 * answers to identity-tagged fields. A role with no field (admin deleted it)
 * resolves to "".
 */
export function deriveParticipant(
  identityFields: FormField[],
  responses: Record<string, unknown>
): ParticipantInfo {
  const value = (role: FormFieldIdentity): string => {
    const field = identityFields.find((f) => f.identity === role);
    if (!field) return "";
    const raw = responses[field.key];
    return raw == null ? "" : String(raw).trim();
  };
  return {
    name: value("name"),
    email: value("email").toLowerCase(),
    phone: value("phone"),
    department: value("department"),
    year: value("year"),
  };
}
