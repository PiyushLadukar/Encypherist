import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-guard";
import { store } from "@/lib/store";

const settingsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  contact_email: z.string().trim().email().optional().or(z.literal("")),
});

const socialLinkSchema = z.object({
  id: z.string().optional(),
  platform: z.string().trim().min(1).max(40),
  url: z.string().trim().url(),
  visible: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});

const bodySchema = z.object({
  settings: settingsSchema,
  socialLinks: z.array(socialLinkSchema).default([]),
});

export async function PATCH(request: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings data." }, { status: 400 });
  }

  store.siteSettings = {
    ...store.siteSettings,
    ...parsed.data.settings,
    tagline: parsed.data.settings.tagline || null,
    description: parsed.data.settings.description || null,
    contact_email: parsed.data.settings.contact_email || null,
    updated_at: new Date().toISOString(),
  };

  for (const link of parsed.data.socialLinks) {
    const existingIndex = store.socialLinks.findIndex((l) => l.platform === link.platform);
    if (existingIndex >= 0) {
      store.socialLinks[existingIndex] = { ...store.socialLinks[existingIndex], ...link };
    } else {
      store.socialLinks.push({ id: randomUUID(), ...link });
    }
  }

  return NextResponse.json({ success: true });
}
