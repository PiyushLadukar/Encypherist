import "server-only";
import { store } from "@/lib/store";
import type { SiteSettings, SocialLink } from "@/types/database";

export async function getSiteSettings(): Promise<SiteSettings> {
  return store.siteSettings;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  return [...store.socialLinks]
    .filter((l) => l.visible)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function getAllSocialLinks(): Promise<SocialLink[]> {
  return [...store.socialLinks].sort((a, b) => a.sort_order - b.sort_order);
}
