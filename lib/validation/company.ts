import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required").max(255),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  industry: z.string().max(100).optional().or(z.literal("")),
  sizeBand: z
    .enum(["1-10", "11-50", "51-200", "201-1000", "1000+"])
    .optional()
    .or(z.literal("")),
  hqCity: z.string().max(100).optional().or(z.literal("")),
  hqCountry: z
    .string()
    .length(2, "Country code must be 2 characters (ISO 3166-1 alpha-2)")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type CompanyInput = z.infer<typeof companySchema>;

// Transform empty strings to null/undefined for database storage
export function transformCompanyInput(input: CompanyInput) {
  return {
    name: input.name,
    website: input.website || null,
    industry: input.industry || null,
    sizeBand: input.sizeBand || null,
    hqCity: input.hqCity || null,
    hqCountry: input.hqCountry || null,
    notes: input.notes || null,
  };
}

export const SIZE_BAND_OPTIONS = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-1000", label: "201-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
] as const;
