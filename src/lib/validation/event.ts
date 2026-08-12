import { z } from "zod";

const scheduleItemSchema = z.object({
  time: z.string().trim().optional(),
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
});

export const eventSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  title: z.string().trim().min(2).max(160),
  type: z.enum([
    "hackathon",
    "workshop",
    "talk",
    "competition",
    "seminar",
    "donation_drive",
    "other",
  ]),
  status: z.enum(["draft", "published", "archived"]),
  summary: z.string().trim().max(280).optional().or(z.literal("")),
  description: z.string().trim().max(8000).optional().or(z.literal("")),
  start_at: z.string().trim().optional().or(z.literal("")).nullable(),
  end_at: z.string().trim().optional().or(z.literal("")).nullable(),
  location: z.string().trim().max(200).optional().or(z.literal("")).nullable(),
  poster_url: z.string().trim().url().optional().or(z.literal("")).nullable(),
  registration_enabled: z.boolean().default(false),
  registration_deadline: z.string().trim().optional().or(z.literal("")).nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  eligibility: z.string().trim().max(2000).optional().or(z.literal("")).nullable(),
  rules: z.string().trim().max(8000).optional().or(z.literal("")).nullable(),
  schedule: z.array(scheduleItemSchema).default([]),
  confidence: z.enum(["verified", "likely", "unverified"]).default("verified"),
});

export type EventInput = z.infer<typeof eventSchema>;
