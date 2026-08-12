import "server-only";
import { store } from "@/lib/store";
import type { Project } from "@/types/database";

export async function getProjects(): Promise<Project[]> {
  return [...store.projects].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getPublishedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.published);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return store.projects.find((p) => p.slug === slug && p.published) ?? null;
}

/** Admin-only in practice: includes unpublished projects. */
export async function getProjectById(id: string): Promise<Project | null> {
  return store.projects.find((p) => p.id === id) ?? null;
}

/** Published projects that list this exact name as a contributor — powers the member↔project link. */
export async function getProjectsByContributorName(name: string): Promise<Project[]> {
  const normalized = name.trim().toLowerCase();
  const projects = await getPublishedProjects();
  return projects.filter((p) =>
    p.contributors.some((c) => c.trim().toLowerCase() === normalized)
  );
}
