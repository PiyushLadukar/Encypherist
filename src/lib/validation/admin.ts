import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const createAdminSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  role: z.enum(["admin", "super_admin"]),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
