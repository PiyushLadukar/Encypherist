/**
 * Hand-written types for the MongoDB-backed admin/event system (auth, events,
 * registrations, forms). Mirrors the style of `types/database.ts` (which still
 * describes the unused Supabase schema behind Members/Projects/Gallery/Settings —
 * those stay on `src/lib/store.ts` and are untouched by this system).
 */

export type AdminRole = "super_admin" | "admin";

export type Admin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

/** Admin-controlled publication state. Time-based states (open/closed/ongoing/
 * completed) are derived from dates at read time — see `deriveEventStatus`. */
export type EventPublicationStatus = "draft" | "published" | "archived";

/** Combines admin-controlled publication state with date-derived lifecycle for display. */
export type EventDisplayStatus =
  | "draft"
  | "upcoming"
  | "registration_open"
  | "registration_closed"
  | "ongoing"
  | "completed"
  | "archived";

export type RegistrationAudience = "everyone" | "college_only";

export type EligibilityConfig = {
  audience: RegistrationAudience;
  departments: string[] | "all";
  years: string[] | "all";
  semesters: string[] | "all";
};

export type RegistrationMode = "individual" | "team" | "both";

export type RegistrationSettings = {
  type: RegistrationMode;
  teamSize: { min: number; max: number } | null;
};

export type FormFieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "multiselect"
  | "file"
  | "url"
  | "department"
  | "year"
  | "college";

export type FormField = {
  key: string;
  type: FormFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: string;
  /** For dropdown/radio/checkbox/multiselect. */
  options?: string[];
  order: number;
};

export type RegistrationForm = {
  version: number;
  fields: FormField[];
};

export type EventCoordinator = {
  name: string;
  email: string;
  phone: string;
};

export type Event = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  venue: string | null;
  registrationDeadline: string | null;
  coordinator: EventCoordinator;
  posterUrl: string | null;
  status: EventPublicationStatus;
  registrationEnabled: boolean;
  eligibility: EligibilityConfig;
  registration: RegistrationSettings;
  registrationForm: RegistrationForm;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RegistrationStatus = "pending" | "approved" | "rejected" | "waitlisted";

export type ParticipantInfo = {
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
};

export type TeamInfo = {
  teamName: string;
  leader: ParticipantInfo;
  members: ParticipantInfo[];
};

export type Registration = {
  id: string;
  eventId: string;
  registrationType: "individual" | "team";
  status: RegistrationStatus;
  deletedAt: string | null;
  formVersion: number;
  formSnapshot: FormField[];
  responses: Record<string, unknown>;
  individual: ParticipantInfo | null;
  team: TeamInfo | null;
  submittedAt: string;
  updatedAt: string;
  updatedBy: string | null;
};

export type AuditLogEntry = {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  meta: Record<string, unknown>;
  createdAt: string;
};
