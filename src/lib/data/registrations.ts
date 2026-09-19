import "server-only";
import { ObjectId, type Filter, type Document } from "mongodb";
import { getCollections } from "@/lib/mongodb";
import { toRegistration } from "@/lib/mappers";
import { escapeRegex } from "@/lib/mongo-regex";
import type { Registration, RegistrationStatus } from "@/types/models";

export type RegistrationListFilter = {
  eventId: string;
  search?: string;
  department?: string;
  year?: string;
  status?: RegistrationStatus | "all";
  registrationType?: "individual" | "team" | "all";
  page?: number;
  pageSize?: number;
};

function participantMatch(search: string): Filter<Document>[] {
  const rx = { $regex: escapeRegex(search), $options: "i" };
  return [
    { "individual.name": rx },
    { "individual.email": rx },
    { "team.teamName": rx },
    { "team.leader.name": rx },
    { "team.leader.email": rx },
  ];
}

export async function listRegistrations({
  eventId,
  search,
  department,
  year,
  status = "all",
  registrationType = "all",
  page = 1,
  pageSize = 25,
}: RegistrationListFilter) {
  const { registrations } = await getCollections();
  const filter: Filter<Document> = { eventId, deletedAt: null };

  if (search) filter.$or = participantMatch(search);
  if (status !== "all") filter.status = status;
  if (registrationType !== "all") filter.registrationType = registrationType;
  if (department) {
    filter.$and = [{ $or: [{ "individual.department": department }, { "team.leader.department": department }] }];
  }
  if (year) {
    const yearOr = { $or: [{ "individual.year": year }, { "team.leader.year": year }] };
    filter.$and = filter.$and ? [...(filter.$and as Document[]), yearOr] : [yearOr];
  }

  const total = await registrations.countDocuments(filter);
  const docs = await registrations
    .find(filter)
    .sort({ submittedAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  return { registrations: docs.map(toRegistration), total };
}

export async function getRegistrationStats(eventId: string) {
  const { registrations } = await getCollections();
  const [total, pending, approved, rejected, waitlisted, teams] = await Promise.all([
    registrations.countDocuments({ eventId, deletedAt: null }),
    registrations.countDocuments({ eventId, deletedAt: null, status: "pending" }),
    registrations.countDocuments({ eventId, deletedAt: null, status: "approved" }),
    registrations.countDocuments({ eventId, deletedAt: null, status: "rejected" }),
    registrations.countDocuments({ eventId, deletedAt: null, status: "waitlisted" }),
    registrations.countDocuments({ eventId, deletedAt: null, registrationType: "team" }),
  ]);

  return { total, pending, approved, rejected, waitlisted, teams };
}

export async function getRegistrationById(id: string): Promise<Registration | null> {
  if (!ObjectId.isValid(id)) return null;
  const { registrations } = await getCollections();
  const doc = await registrations.findOne({ _id: new ObjectId(id) });
  return doc ? toRegistration(doc) : null;
}

export async function listDistinctDepartmentsAndYears(eventId: string) {
  const { registrations } = await getCollections();
  const docs = await registrations.find({ eventId, deletedAt: null }).toArray();
  const departments = new Set<string>();
  const years = new Set<string>();
  for (const doc of docs) {
    const dept = doc.individual?.department ?? doc.team?.leader?.department;
    const year = doc.individual?.year ?? doc.team?.leader?.year;
    if (dept) departments.add(dept);
    if (year) years.add(year);
  }
  return { departments: Array.from(departments).sort(), years: Array.from(years).sort() };
}

/** All non-deleted registrations for an event, unpaginated — used by the export routes. */
export async function listAllRegistrationsForExport(eventId: string): Promise<Registration[]> {
  const { registrations } = await getCollections();
  const docs = await registrations.find({ eventId, deletedAt: null }).sort({ submittedAt: 1 }).toArray();
  return docs.map(toRegistration);
}

/** Team registrations only, unpaginated (team counts are small relative to total participants). */
export async function listTeamRegistrations(eventId: string): Promise<Registration[]> {
  const { registrations } = await getCollections();
  const docs = await registrations
    .find({ eventId, deletedAt: null, registrationType: "team" })
    .sort({ submittedAt: -1 })
    .toArray();
  return docs.map(toRegistration);
}
