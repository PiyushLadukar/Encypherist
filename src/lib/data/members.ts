import "server-only";
import { store } from "@/lib/store";
import type { Member, TeamGroup } from "@/types/database";

const TEAM_ORDER: TeamGroup[] = ["final", "third", "second", "history"];

export async function getMembers(): Promise<Member[]> {
  return [...store.members].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getPublishedMembers(): Promise<Member[]> {
  return (await getMembers()).filter((m) => m.published);
}

export async function getMembersGrouped(): Promise<Record<TeamGroup, Member[]>> {
  const members = await getPublishedMembers();
  const grouped: Record<TeamGroup, Member[]> = { final: [], third: [], second: [], history: [] };
  for (const member of members) {
    grouped[member.team_group].push(member);
  }
  return grouped;
}

export function orderedTeamGroups(): TeamGroup[] {
  return TEAM_ORDER;
}

export async function getMemberBySlug(slug: string): Promise<Member | null> {
  return store.members.find((m) => m.slug === slug && m.published) ?? null;
}

export async function getMemberById(id: string): Promise<Member | null> {
  return store.members.find((m) => m.id === id) ?? null;
}

/**
 * Best-effort name match against the published roster — powers the
 * member↔project link on project detail pages (spec §41-C "project
 * network"). A contributor name that doesn't match any member just renders
 * as plain text; this never invents a member to link to.
 */
export async function findPublishedMemberByName(name: string): Promise<Member | null> {
  const normalized = name.trim().toLowerCase();
  const members = await getPublishedMembers();
  return members.find((m) => m.name.trim().toLowerCase() === normalized) ?? null;
}
