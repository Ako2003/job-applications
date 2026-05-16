import { z } from "zod";

export const jobPlatformSalarySchema = z.object({
  country: z.string().min(1, "Country is required"),
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  salaryMinAnnual: z.coerce.number().int().positive().optional(),
  salaryMaxAnnual: z.coerce.number().int().positive().optional(),
  currency: z.string().min(1).default("EUR"),
  notes: z.string().optional(),
});

export type JobPlatformSalaryInput = z.infer<typeof jobPlatformSalarySchema>;

// Common countries for job searching
export const COUNTRY_OPTIONS = [
  { value: "Germany", label: "Germany" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Austria", label: "Austria" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "France", label: "France" },
  { value: "Belgium", label: "Belgium" },
  { value: "Ireland", label: "Ireland" },
  { value: "Sweden", label: "Sweden" },
  { value: "Denmark", label: "Denmark" },
  { value: "Norway", label: "Norway" },
  { value: "Finland", label: "Finland" },
  { value: "Poland", label: "Poland" },
  { value: "Czech Republic", label: "Czech Republic" },
  { value: "Portugal", label: "Portugal" },
  { value: "Spain", label: "Spain" },
  { value: "Italy", label: "Italy" },
  { value: "USA", label: "USA" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "Azerbaijan", label: "Azerbaijan" },
  { value: "Ukraine", label: "Ukraine" },
  { value: "Other", label: "Other" },
];

// Common job platforms
export const PLATFORM_OPTIONS = [
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Indeed", label: "Indeed" },
  { value: "Stepstone", label: "Stepstone" },
  { value: "Glassdoor", label: "Glassdoor" },
  { value: "XING", label: "XING" },
  { value: "Djinni", label: "Djinni" },
  { value: "Monster", label: "Monster" },
  { value: "Honeypot", label: "Honeypot" },
  { value: "Stack Overflow Jobs", label: "Stack Overflow Jobs" },
  { value: "AngelList", label: "AngelList" },
  { value: "RemoteOK", label: "RemoteOK" },
  { value: "WeWorkRemotely", label: "We Work Remotely" },
  { value: "Turing", label: "Turing" },
  { value: "Toptal", label: "Toptal" },
  { value: "Company Website", label: "Company Website" },
  { value: "Recruiter", label: "Recruiter" },
  { value: "Other", label: "Other" },
];

// Currency options
export const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR (€)" },
  { value: "USD", label: "USD ($)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CHF", label: "CHF" },
  { value: "SEK", label: "SEK" },
  { value: "NOK", label: "NOK" },
  { value: "DKK", label: "DKK" },
  { value: "PLN", label: "PLN" },
  { value: "CZK", label: "CZK" },
  { value: "AZN", label: "AZN" },
  { value: "UAH", label: "UAH" },
  { value: "CAD", label: "CAD" },
  { value: "AUD", label: "AUD" },
];
