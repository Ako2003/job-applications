import { z } from "zod";

export const PLAN_COUNTRY_OPTIONS = [
  { value: "Germany", label: "Germany" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Austria", label: "Austria" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "Belgium", label: "Belgium" },
  { value: "Luxembourg", label: "Luxembourg" },
  { value: "France", label: "France" },
  { value: "UK", label: "United Kingdom" },
  { value: "Ireland", label: "Ireland" },
  { value: "Sweden", label: "Sweden" },
  { value: "Denmark", label: "Denmark" },
  { value: "Norway", label: "Norway" },
  { value: "Finland", label: "Finland" },
  { value: "Poland", label: "Poland" },
  { value: "Czech Republic", label: "Czech Republic" },
  { value: "Estonia", label: "Estonia" },
  { value: "Spain", label: "Spain" },
  { value: "Portugal", label: "Portugal" },
  { value: "Italy", label: "Italy" },
  { value: "USA", label: "USA" },
  { value: "Canada", label: "Canada" },
  { value: "Singapore", label: "Singapore" },
  { value: "UAE", label: "UAE" },
  { value: "Remote", label: "Remote (Worldwide)" },
  { value: "Other", label: "Other" },
] as const;

export const PLAN_PLATFORM_OPTIONS = [
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Indeed", label: "Indeed" },
  { value: "Stepstone", label: "Stepstone" },
  { value: "Glassdoor", label: "Glassdoor" },
  { value: "XING", label: "XING" },
  { value: "Djinni", label: "Djinni" },
  { value: "Company Website", label: "Company Website" },
  { value: "Recruiter", label: "Recruiter" },
  { value: "Referral", label: "Referral" },
  { value: "Multiple", label: "Multiple Platforms" },
  { value: "Other", label: "Other" },
] as const;

export const applicationPlanSchema = z.object({
  country: z.string().min(1, "Country is required"),
  appsPerWeek: z.coerce.number().int().min(1, "Must be at least 1").max(100, "Must be at most 100"),
  platform: z.string().min(1, "Platform is required"),
  startedAt: z.coerce.date().optional(),
  isActive: z.coerce.boolean().default(true),
  notes: z.string().optional(),
});

export type ApplicationPlanInput = z.infer<typeof applicationPlanSchema>;

export function transformApplicationPlanInput(input: ApplicationPlanInput) {
  return {
    country: input.country,
    appsPerWeek: input.appsPerWeek,
    platform: input.platform,
    startedAt: input.startedAt || new Date(),
    isActive: input.isActive,
    notes: input.notes || null,
  };
}
