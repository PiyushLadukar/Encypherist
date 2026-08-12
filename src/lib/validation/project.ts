import { z } from "zod";

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(2).max(160),
  status: z.enum(["active", "in_development", "deployed", "archived"]),
  summary: z.string().trim().max(280).optional().or(z.literal("")).nullable(),
  problem: z.string().trim().max(4000).optional().or(z.literal("")).nullable(),
  solution: z.string().trim().max(4000).optional().or(z.literal("")).nullable(),
  tech_stack: z.array(z.string().trim().min(1)).default([]),
  contributors: z.array(z.string().trim().min(1)).default([]),
  link_url: z.string().trim().url().optional().or(z.literal("")).nullable(),
  repo_url: z.string().trim().url().optional().or(z.literal("")).nullable(),
  image_url: z.string().trim().url().optional().or(z.literal("")).nullable(),
  published: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
  confidence: z.enum(["verified", "likely", "unverified"]).default("verified"),
});

export type ProjectInput = z.infer<typeof projectSchema>;
