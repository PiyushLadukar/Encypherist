import { z } from "zod";

export const memberSocialsSchema = z.object({
  instagram: z.string().trim().url().optional().or(z.literal("")),
  linkedin: z.string().trim().url().optional().or(z.literal("")),
  github: z.string().trim().url().optional().or(z.literal("")),
  twitter: z.string().trim().url().optional().or(z.literal("")),
});

export const memberSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(2).max(120),
  designation: z.string().trim().min(2).max(120),
  team_group: z.enum(["final", "third", "second"]),
  year_session: z.string().trim().min(4).max(20),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  skills: z.array(z.string().trim().min(1)).default([]),
  photo_url: z.string().trim().url().optional().or(z.literal("")),
  photo_position: z.string().trim().optional().or(z.literal("")),
  socials: memberSocialsSchema.default({}),
  is_core: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
  published: z.boolean().default(true),
  confidence: z.enum(["verified", "likely", "unverified"]).default("verified"),
});

export type MemberInput = z.infer<typeof memberSchema>;
