import { z } from "zod";

// Enum options for dropdowns
export const APPLICATION_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "APPLIED", label: "Applied" },
  { value: "SCREENING", label: "Screening" },
  { value: "PHONE_INTERVIEW", label: "Phone Interview" },
  { value: "TECHNICAL_INTERVIEW", label: "Technical Interview" },
  { value: "ONSITE_FINAL", label: "Onsite/Final" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "GHOSTED", label: "Ghosted" },
] as const;

export const SOURCE_OPTIONS = [
  { value: "INDEED", label: "Indeed" },
  { value: "STEPSTONE", label: "Stepstone" },
  { value: "GLASSDOOR", label: "Glassdoor" },
  { value: "XING", label: "Xing" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "DJINNI", label: "Djinni" },
  { value: "COMPANY_WEBSITE", label: "Company Website" },
  { value: "REFERRAL", label: "Referral" },
  { value: "RECRUITER_OUTREACH", label: "Recruiter Outreach" },
  { value: "OTHER", label: "Other" },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "FREELANCE", label: "Freelance" },
] as const;

export const REMOTE_POLICY_OPTIONS = [
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "REMOTE", label: "Remote" },
] as const;

export const EVENT_TYPE_OPTIONS = [
  { value: "APPLIED", label: "Applied" },
  { value: "AUTO_REJECTED", label: "Auto-rejected" },
  { value: "SCREENING_SCHEDULED", label: "Screening Scheduled" },
  { value: "SCREENING_DONE", label: "Screening Done" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
  { value: "INTERVIEW_DONE", label: "Interview Done" },
  { value: "TECHNICAL_TASK_RECEIVED", label: "Technical Task Received" },
  { value: "TECHNICAL_TASK_SUBMITTED", label: "Technical Task Submitted" },
  { value: "OFFER_RECEIVED", label: "Offer Received" },
  { value: "OFFER_NEGOTIATING", label: "Offer Negotiating" },
  { value: "OFFER_ACCEPTED", label: "Offer Accepted" },
  { value: "OFFER_DECLINED", label: "Offer Declined" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "FOLLOW_UP_SENT", label: "Follow-up Sent" },
  { value: "GHOSTED", label: "Ghosted" },
  { value: "NOTE", label: "Note" },
] as const;

// Common currency options
export const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR (€)" },
  { value: "USD", label: "USD ($)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CHF", label: "CHF" },
  { value: "AZN", label: "AZN (₼)" },
  { value: "UAH", label: "UAH (₴)" },
] as const;

// Zod enums
export const applicationStatusEnum = z.enum([
  "DRAFT",
  "APPLIED",
  "SCREENING",
  "PHONE_INTERVIEW",
  "TECHNICAL_INTERVIEW",
  "ONSITE_FINAL",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
  "GHOSTED",
]);

export const sourceEnum = z.enum([
  "INDEED",
  "STEPSTONE",
  "GLASSDOOR",
  "XING",
  "LINKEDIN",
  "DJINNI",
  "COMPANY_WEBSITE",
  "REFERRAL",
  "RECRUITER_OUTREACH",
  "OTHER",
]);

export const employmentTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
]);

export const remotePolicyEnum = z.enum(["ONSITE", "HYBRID", "REMOTE"]);

export const eventTypeEnum = z.enum([
  "APPLIED",
  "AUTO_REJECTED",
  "SCREENING_SCHEDULED",
  "SCREENING_DONE",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_DONE",
  "TECHNICAL_TASK_RECEIVED",
  "TECHNICAL_TASK_SUBMITTED",
  "OFFER_RECEIVED",
  "OFFER_NEGOTIATING",
  "OFFER_ACCEPTED",
  "OFFER_DECLINED",
  "REJECTED",
  "WITHDRAWN",
  "FOLLOW_UP_SENT",
  "GHOSTED",
  "NOTE",
]);

export const languageEnum = z.enum([
  "EN",
  "DE",
  "RU",
  "FR",
  "AZ",
  "UK",
  "OTHER",
]);

// Application schema
export const applicationSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required").max(200),
  jobUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  source: sourceEnum,
  sourceListingId: z.string().optional().or(z.literal("")),

  location: z.string().max(100).optional().or(z.literal("")),
  country: z
    .string()
    .length(2, "Country code must be 2 characters")
    .optional()
    .or(z.literal("")),
  remote: remotePolicyEnum.optional(),
  employment: employmentTypeEnum.optional(),
  language: languageEnum.default("EN"),

  // Salary in minor units (cents)
  salaryMin: z.coerce.number().int().nonnegative().optional(),
  salaryMax: z.coerce.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional().or(z.literal("")),

  cvTemplateId: z.string().optional().or(z.literal("")),
  coverLetter: z.string().optional().or(z.literal("")),

  status: applicationStatusEnum.default("APPLIED"),
  appliedAt: z.coerce.date(),
  nextActionAt: z.coerce.date().optional(),

  jobDescription: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

// For creating an event
export const applicationEventSchema = z.object({
  type: eventTypeEnum,
  occurredAt: z.coerce.date(),
  notes: z.string().optional().or(z.literal("")),
});

export type ApplicationEventInput = z.infer<typeof applicationEventSchema>;

// Status update (for inline status change)
export const statusUpdateSchema = z.object({
  status: applicationStatusEnum,
  notes: z.string().optional().or(z.literal("")),
});

export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;

// Helper to transform application input for database
export function transformApplicationInput(input: ApplicationInput) {
  return {
    companyId: input.companyId,
    role: input.role,
    jobUrl: input.jobUrl || null,
    source: input.source,
    sourceListingId: input.sourceListingId || null,
    location: input.location || null,
    country: input.country || null,
    remote: input.remote || null,
    employment: input.employment || null,
    language: input.language,
    salaryMin: input.salaryMin || null,
    salaryMax: input.salaryMax || null,
    currency: input.currency || null,
    cvTemplateId: input.cvTemplateId || null,
    coverLetter: input.coverLetter || null,
    status: input.status,
    appliedAt: input.appliedAt,
    nextActionAt: input.nextActionAt || null,
    jobDescription: input.jobDescription || null,
    notes: input.notes || null,
  };
}

// Helper to get status badge color
export function getStatusColor(status: string): string {
  switch (status) {
    case "DRAFT":
      return "secondary";
    case "APPLIED":
      return "default";
    case "SCREENING":
    case "PHONE_INTERVIEW":
    case "TECHNICAL_INTERVIEW":
    case "ONSITE_FINAL":
      return "default"; // blue-ish
    case "OFFER":
      return "default"; // green would be nice
    case "REJECTED":
    case "WITHDRAWN":
    case "GHOSTED":
      return "secondary";
    default:
      return "secondary";
  }
}

// Map status to corresponding event type
export function statusToEventType(
  status: string
): z.infer<typeof eventTypeEnum> {
  const mapping: Record<string, z.infer<typeof eventTypeEnum>> = {
    APPLIED: "APPLIED",
    SCREENING: "SCREENING_SCHEDULED",
    PHONE_INTERVIEW: "INTERVIEW_SCHEDULED",
    TECHNICAL_INTERVIEW: "INTERVIEW_SCHEDULED",
    ONSITE_FINAL: "INTERVIEW_SCHEDULED",
    OFFER: "OFFER_RECEIVED",
    REJECTED: "REJECTED",
    WITHDRAWN: "WITHDRAWN",
    GHOSTED: "GHOSTED",
  };
  return mapping[status] || "NOTE";
}
