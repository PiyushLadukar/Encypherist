import type { MetadataRoute } from "next";
import { getPublishedEvents } from "@/lib/data/events";
import { getPublishedMembers } from "@/lib/data/members";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, members] = await Promise.all([
    getPublishedEvents().catch(() => []),
    getPublishedMembers().catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/members`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/events`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/gallery`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${SITE_URL}/events/${event.slug}`,
    lastModified: event.updated_at,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const memberRoutes: MetadataRoute.Sitemap = members.map((member) => ({
    url: `${SITE_URL}/members/${member.slug}`,
    lastModified: member.updated_at,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...eventRoutes, ...memberRoutes];
}
