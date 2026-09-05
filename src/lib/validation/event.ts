import { z } from "zod";
import { registrationFormSchema } from "./form-field";

const stringOrAll = z.union([z.literal("all"), z.array(z.string().trim().min(1).max(80)).max(30)]);

export const eligibilitySchema = z.object({
  audience: z.enum(["everyone", "college_only"]),
  departments: stringOrAll,
  years: stringOrAll,
  semesters: stringOrAll,
});

export const registrationSettingsSchema = z
  .object({
    type: z.enum(["individual", "team", "both"]),
    teamSize: z
      .object({
        min: z.number().int().min(1),
        max: z.number().int().min(1),
      })
      .nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.type !== "individual") {
      if (!val.teamSize) {
        ctx.addIssue({ code: "custom", path: ["teamSize"], message: "Set a minimum and maximum team size" });
      } else if (val.teamSize.max < val.teamSize.min) {
        ctx.addIssue({
          code: "custom",
          path: ["teamSize", "max"],
          message: "Maximum team size must be greater than or equal to the minimum",
        });
      }
    }
  });

export const eventSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(8000).optional().or(z.literal("")),
  startDate: z.string().trim().min(1, "Start date is required"),
  startTime: z.string().trim().optional().or(z.literal("")),
  endDate: z.string().trim().optional().or(z.literal("")),
  endTime: z.string().trim().optional().or(z.literal("")),
  venue: z.string().trim().max(200).optional().or(z.literal("")),
  registrationDeadline: z.string().trim().optional().or(z.literal("")),
  coordinator: z.object({
    name: z.string().trim().max(120).optional().or(z.literal("")),
    email: z.string().trim().toLowerCase().max(160).email().optional().or(z.literal("")),
    phone: z.string().trim().max(20).optional().or(z.literal("")),
  }),
  registrationEnabled: z.boolean().default(false),
  eligibility: eligibilitySchema,
  registration: registrationSettingsSchema,
  registrationForm: registrationFormSchema,
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type EventInput = z.infer<typeof eventSchema>;
