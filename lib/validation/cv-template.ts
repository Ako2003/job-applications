import { z } from "zod";

export const LANGUAGE_OPTIONS = [
  { value: "EN", label: "English" },
  { value: "DE", label: "German" },
  { value: "RU", label: "Russian" },
  { value: "FR", label: "French" },
  { value: "AZ", label: "Azerbaijani" },
  { value: "UK", label: "Ukrainian" },
  { value: "OTHER", label: "Other" },
] as const;

export const languageEnum = z.enum(["EN", "DE", "RU", "FR", "AZ", "UK", "OTHER"]);

export type Language = z.infer<typeof languageEnum>;

export const cvTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z.string().max(500).optional().or(z.literal("")),
  language: languageEnum,
});

export type CvTemplateInput = z.infer<typeof cvTemplateSchema>;

// For updating CV metadata (without file upload)
export const cvTemplateUpdateSchema = cvTemplateSchema.extend({
  isArchived: z.boolean().optional(),
});

export type CvTemplateUpdateInput = z.infer<typeof cvTemplateUpdateSchema>;

export function transformCvTemplateInput(input: CvTemplateInput) {
  return {
    name: input.name,
    description: input.description || null,
    language: input.language,
  };
}
