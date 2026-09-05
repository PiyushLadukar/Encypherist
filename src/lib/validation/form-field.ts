import { z } from "zod";

export const FORM_FIELD_TYPES = [
  "short_text",
  "long_text",
  "email",
  "phone",
  "number",
  "dropdown",
  "radio",
  "checkbox",
  "multiselect",
  "file",
  "url",
  "department",
  "year",
  "college",
] as const;

// "checkbox" is a single yes/no confirmation (no options); "multiselect" is
// the options-based checkbox-group type ("select any that apply").
export const OPTION_FIELD_TYPES = new Set(["dropdown", "radio", "multiselect"]);

export const formFieldSchema = z
  .object({
    key: z
      .string()
      .trim()
      .min(1)
      .max(60)
      .regex(/^[a-z][a-z0-9_]*$/, "Use lowercase letters, numbers and underscores, starting with a letter"),
    type: z.enum(FORM_FIELD_TYPES),
    label: z.string().trim().min(1, "Label is required").max(160),
    description: z.string().trim().max(500).optional(),
    placeholder: z.string().trim().max(160).optional(),
    required: z.boolean().default(false),
    defaultValue: z.string().trim().max(500).optional(),
    options: z.array(z.string().trim().min(1).max(160)).max(50).optional(),
    order: z.number().int().min(0),
  })
  .superRefine((field, ctx) => {
    if (OPTION_FIELD_TYPES.has(field.type) && (!field.options || field.options.length < 1)) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Add at least one option for this field type",
      });
    }
  });

export type FormFieldInput = z.infer<typeof formFieldSchema>;

export const registrationFormSchema = z.object({
  version: z.number().int().min(1),
  fields: z
    .array(formFieldSchema)
    .max(40)
    .refine((fields) => new Set(fields.map((f) => f.key)).size === fields.length, {
      message: "Field keys must be unique",
    }),
});
