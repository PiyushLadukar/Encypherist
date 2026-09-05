import "server-only";
import type { ObjectId, WithId, Document } from "mongodb";
import type { Admin, Event, Registration, AuditLogEntry } from "@/types/models";

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function toIsoOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return toIso(value);
}

export function toAdmin(doc: WithId<Document>): Admin {
  return {
    id: (doc._id as ObjectId).toHexString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    isActive: doc.isActive,
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
    lastLoginAt: toIsoOrNull(doc.lastLoginAt),
  };
}

export function toEvent(doc: WithId<Document>): Event {
  return {
    id: (doc._id as ObjectId).toHexString(),
    slug: doc.slug,
    name: doc.name,
    description: doc.description ?? null,
    startDate: toIsoOrNull(doc.startDate),
    startTime: doc.startTime ?? null,
    endDate: toIsoOrNull(doc.endDate),
    endTime: doc.endTime ?? null,
    venue: doc.venue ?? null,
    registrationDeadline: toIsoOrNull(doc.registrationDeadline),
    coordinator: doc.coordinator ?? { name: "", email: "", phone: "" },
    posterUrl: doc.posterUrl ?? null,
    status: doc.status,
    registrationEnabled: Boolean(doc.registrationEnabled),
    eligibility: doc.eligibility ?? {
      audience: "everyone",
      departments: "all",
      years: "all",
      semesters: "all",
    },
    registration: doc.registration ?? { type: "individual", teamSize: null },
    registrationForm: doc.registrationForm ?? { version: 1, fields: [] },
    createdBy: doc.createdBy ? String(doc.createdBy) : null,
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  };
}

export function toRegistration(doc: WithId<Document>): Registration {
  return {
    id: (doc._id as ObjectId).toHexString(),
    eventId: String(doc.eventId),
    registrationType: doc.registrationType,
    status: doc.status,
    deletedAt: toIsoOrNull(doc.deletedAt),
    formVersion: doc.formVersion ?? 1,
    formSnapshot: doc.formSnapshot ?? [],
    responses: doc.responses ?? {},
    individual: doc.individual ?? null,
    team: doc.team ?? null,
    submittedAt: toIso(doc.submittedAt),
    updatedAt: toIso(doc.updatedAt),
    updatedBy: doc.updatedBy ? String(doc.updatedBy) : null,
  };
}

export function toAuditLogEntry(doc: WithId<Document>): AuditLogEntry {
  return {
    id: (doc._id as ObjectId).toHexString(),
    adminId: String(doc.adminId),
    adminName: doc.adminName,
    action: doc.action,
    targetType: doc.targetType,
    targetId: String(doc.targetId),
    meta: doc.meta ?? {},
    createdAt: toIso(doc.createdAt),
  };
}
