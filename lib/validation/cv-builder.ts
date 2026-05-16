import { z } from "zod";

// Experience item for the master profile
export const experienceItemSchema = z.object({
  id: z.string(), // Required for linking variations
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  startDate: z.string().min(1, "Start date is required"), // "MM/YYYY" format
  endDate: z.string().optional(), // "MM/YYYY" or empty if current
  current: z.boolean().default(false),
  bullets: z.array(z.string()), // Master bullets
});

// Experience override for variations - references master by id
export const experienceVariationSchema = z.object({
  masterId: z.string(), // References the master experience id
  title: z.string(), // Can be same or modified
  company: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()), // Customized bullets for this variation
  hidden: z.boolean().optional(), // Option to hide this experience in this variation
});

export const educationItemSchema = z.object({
  id: z.string().optional(),
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution is required"),
  location: z.string().optional(),
  startYear: z.string().min(1, "Start year is required"),
  endYear: z.string().optional(),
});

export const certificationItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().optional(),
  year: z.string().optional(),
  topics: z.array(z.string()).optional(),
});

export const achievementItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Achievement is required"),
  date: z.string().optional(),
});

export const languageSkillItemSchema = z.object({
  id: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  level: z.string(), // "Native", "C2", "C1", "B2", "B1", "A2", "A1"
});

export const skillGroupSchema = z.object({
  id: z.string().optional(),
  skills: z.string().min(1, "Skills are required"), // Comma-separated skills
});

export const projectItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Project name is required"),
  techStack: z.string().optional(),
  bullets: z.array(z.string()),
  liveUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

export const referenceItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  title: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

// Master CV Profile schema (static info)
export const cvProfileSchema = z.object({
  // Personal Info
  fullName: z.string().min(1, "Full name is required"),
  tagline: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email"),
  phone: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  photoUrl: z.string().optional().or(z.literal("")),

  // Summary
  summary: z.string().optional().or(z.literal("")),

  // Sections (arrays)
  highlights: z.array(z.string()).optional().default([]),
  technicalSkills: z.array(skillGroupSchema).optional().default([]),
  experience: z.array(experienceItemSchema).optional().default([]),
  education: z.array(educationItemSchema).optional().default([]),
  certifications: z.array(certificationItemSchema).optional().default([]),
  achievements: z.array(achievementItemSchema).optional().default([]),
  languageSkills: z.array(languageSkillItemSchema).optional().default([]),
  featuredProjects: z.array(projectItemSchema).optional().default([]),
  references: z.array(referenceItemSchema).optional().default([]),
});

// CV Variation schema (only experience customization)
export const cvVariationSchema = z.object({
  name: z.string().min(1, "Variation name is required"),
  language: z.enum(["EN", "DE", "RU", "FR", "AZ", "UK", "OTHER"]).default("EN"),
  experience: z.array(experienceVariationSchema).optional().default([]),
});

export type CVProfileInput = z.infer<typeof cvProfileSchema>;
export type CVVariationInput = z.infer<typeof cvVariationSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type ExperienceVariation = z.infer<typeof experienceVariationSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type CertificationItem = z.infer<typeof certificationItemSchema>;
export type AchievementItem = z.infer<typeof achievementItemSchema>;
export type LanguageSkillItem = z.infer<typeof languageSkillItemSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type ReferenceItem = z.infer<typeof referenceItemSchema>;

// Language level options for dropdowns
export const LANGUAGE_LEVELS = [
  { value: "Native", label: "Native" },
  { value: "C2", label: "C2 - Proficient" },
  { value: "C1", label: "C1 - Advanced" },
  { value: "B2", label: "B2 - Upper Intermediate" },
  { value: "B1", label: "B1 - Intermediate" },
  { value: "A2", label: "A2 - Elementary" },
  { value: "A1", label: "A1 - Beginner" },
] as const;

export const CV_LANGUAGE_OPTIONS = [
  { value: "EN", label: "English" },
  { value: "DE", label: "German" },
  { value: "RU", label: "Russian" },
  { value: "FR", label: "French" },
  { value: "AZ", label: "Azerbaijani" },
  { value: "UK", label: "Ukrainian" },
  { value: "OTHER", label: "Other" },
] as const;
