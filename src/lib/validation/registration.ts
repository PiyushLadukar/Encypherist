import { z } from "zod";

export const registrationSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{7,15}$/, "Enter a valid phone number"),
  college: z.string().trim().min(2, "Enter your college name").max(160),
  branch: z.string().trim().max(80).optional().or(z.literal("")),
  year: z.string().trim().max(40).optional().or(z.literal("")),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
