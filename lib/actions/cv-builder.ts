"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  cvProfileSchema,
  cvVariationSchema,
  type CVProfileInput,
  type CVVariationInput,
  type ExperienceItem,
  type ExperienceVariation,
  type SkillGroup,
  type EducationItem,
  type CertificationItem,
  type AchievementItem,
  type LanguageSkillItem,
  type ProjectItem,
  type ReferenceItem,
} from "@/lib/validation/cv-builder";
import { generateCVPdf, generateCVPreviewHtml } from "@/lib/pdf-generator";

export type CVBuilderFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// ============ PROFILE ACTIONS ============

// Get the user's CV profile (creates one if it doesn't exist)
export async function getCVProfile() {
  const user = await requireUser();

  let profile = await db.cVProfile.findUnique({
    where: { userId: user.id },
  });

  // Create empty profile if it doesn't exist
  if (!profile) {
    profile = await db.cVProfile.create({
      data: {
        userId: user.id,
        fullName: user.name || "",
        email: user.email,
      },
    });
  }

  return profile;
}

// Update the CV profile
export async function updateCVProfile(
  _prevState: CVBuilderFormState,
  formData: FormData
): Promise<CVBuilderFormState> {
  const user = await requireUser();

  const rawInput = extractProfileFormData(formData);
  const parsed = cvProfileSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.cVProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...transformProfileInput(parsed.data),
    },
    update: transformProfileInput(parsed.data),
  });

  revalidatePath("/cv-builder");
  revalidatePath("/cv-builder/profile");
  return {};
}

// ============ VARIATION ACTIONS ============

// Get all variations for the user
export async function getCVVariations() {
  const user = await requireUser();

  const profile = await db.cVProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!profile) {
    return [];
  }

  return db.cVVariation.findMany({
    where: { profileId: profile.id },
    select: {
      id: true,
      name: true,
      language: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

// Get a single variation
export async function getCVVariation(id: string) {
  const user = await requireUser();

  const profile = await db.cVProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!profile) {
    return null;
  }

  return db.cVVariation.findFirst({
    where: { id, profileId: profile.id },
  });
}

// Create a new variation
export async function createCVVariation(
  _prevState: CVBuilderFormState,
  formData: FormData
): Promise<CVBuilderFormState> {
  const user = await requireUser();

  const profile = await db.cVProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, experience: true },
  });

  if (!profile) {
    return { error: "Please set up your profile first" };
  }

  const rawInput = extractVariationFormData(formData);
  const parsed = cvVariationSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const variation = await db.cVVariation.create({
    data: {
      profileId: profile.id,
      name: parsed.data.name,
      language: parsed.data.language,
      experience: parsed.data.experience || [],
    },
    select: { id: true },
  });

  revalidatePath("/cv-builder");
  redirect(`/cv-builder/${variation.id}`);
}

// Update a variation
export async function updateCVVariation(
  id: string,
  _prevState: CVBuilderFormState,
  formData: FormData
): Promise<CVBuilderFormState> {
  const user = await requireUser();

  const profile = await db.cVProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!profile) {
    return { error: "Profile not found" };
  }

  const existing = await db.cVVariation.findFirst({
    where: { id, profileId: profile.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Variation not found" };
  }

  const rawInput = extractVariationFormData(formData);
  const parsed = cvVariationSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.cVVariation.update({
    where: { id },
    data: {
      name: parsed.data.name,
      language: parsed.data.language,
      experience: parsed.data.experience || [],
    },
  });

  revalidatePath("/cv-builder");
  revalidatePath(`/cv-builder/${id}`);
  return {};
}

// Delete a variation
export async function deleteCVVariation(id: string): Promise<{ error?: string }> {
  const user = await requireUser();

  const profile = await db.cVProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!profile) {
    return { error: "Profile not found" };
  }

  const existing = await db.cVVariation.findFirst({
    where: { id, profileId: profile.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Variation not found" };
  }

  await db.cVVariation.delete({ where: { id } });

  revalidatePath("/cv-builder");
  redirect("/cv-builder");
}

// Duplicate a variation
export async function duplicateCVVariation(id: string): Promise<{ id?: string; error?: string }> {
  const user = await requireUser();

  const profile = await db.cVProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!profile) {
    return { error: "Profile not found" };
  }

  const existing = await db.cVVariation.findFirst({
    where: { id, profileId: profile.id },
  });

  if (!existing) {
    return { error: "Variation not found" };
  }

  const duplicate = await db.cVVariation.create({
    data: {
      profileId: profile.id,
      name: `${existing.name} (Copy)`,
      language: existing.language,
      experience: existing.experience || [],
    },
    select: { id: true },
  });

  revalidatePath("/cv-builder");
  return { id: duplicate.id };
}

// ============ PDF GENERATION ============

// Generate PDF for a variation
export async function generatePdfForVariation(variationId: string): Promise<{ pdf?: string; error?: string }> {
  const user = await requireUser();

  const profile = await db.cVProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return { error: "Profile not found" };
  }

  const variation = await db.cVVariation.findFirst({
    where: { id: variationId, profileId: profile.id },
  });

  if (!variation) {
    return { error: "Variation not found" };
  }

  try {
    const cvData = buildCVData(profile, variation);
    const pdfBuffer = await generateCVPdf(cvData);

    return { pdf: pdfBuffer.toString("base64") };
  } catch (error) {
    console.error("PDF generation error:", error);
    return { error: "Failed to generate PDF" };
  }
}

// Generate preview HTML for a variation
export async function generatePreviewForVariation(variationId: string): Promise<{ html?: string; error?: string }> {
  const user = await requireUser();

  const profile = await db.cVProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return { error: "Profile not found" };
  }

  const variation = await db.cVVariation.findFirst({
    where: { id: variationId, profileId: profile.id },
  });

  if (!variation) {
    return { error: "Variation not found" };
  }

  const cvData = buildCVData(profile, variation);
  const html = generateCVPreviewHtml(cvData);

  return { html };
}

// ============ HELPERS ============

function extractProfileFormData(formData: FormData): CVProfileInput {
  const parseJson = <T>(key: string, defaultValue: T): T => {
    const value = formData.get(key);
    if (!value || value === "") return defaultValue;
    try {
      return JSON.parse(value as string) as T;
    } catch {
      return defaultValue;
    }
  };

  return {
    fullName: (formData.get("fullName") as string) || "",
    tagline: (formData.get("tagline") as string) || "",
    email: (formData.get("email") as string) || "",
    phone: (formData.get("phone") as string) || "",
    location: (formData.get("location") as string) || "",
    photoUrl: (formData.get("photoUrl") as string) || "",
    summary: (formData.get("summary") as string) || "",
    highlights: parseJson("highlights", []),
    technicalSkills: parseJson("technicalSkills", []),
    experience: parseJson("experience", []),
    education: parseJson("education", []),
    certifications: parseJson("certifications", []),
    achievements: parseJson("achievements", []),
    languageSkills: parseJson("languageSkills", []),
    featuredProjects: parseJson("featuredProjects", []),
    references: parseJson("references", []),
  };
}

function extractVariationFormData(formData: FormData): CVVariationInput {
  const parseJson = <T>(key: string, defaultValue: T): T => {
    const value = formData.get(key);
    if (!value || value === "") return defaultValue;
    try {
      return JSON.parse(value as string) as T;
    } catch {
      return defaultValue;
    }
  };

  return {
    name: (formData.get("name") as string) || "",
    language: (formData.get("language") as CVVariationInput["language"]) || "EN",
    experience: parseJson("experience", []),
  };
}

function transformProfileInput(input: CVProfileInput) {
  return {
    fullName: input.fullName,
    tagline: input.tagline || null,
    email: input.email,
    phone: input.phone || null,
    location: input.location || null,
    photoUrl: input.photoUrl || null,
    summary: input.summary || null,
    highlights: input.highlights || [],
    technicalSkills: input.technicalSkills || [],
    experience: input.experience || [],
    education: input.education || [],
    certifications: input.certifications || [],
    achievements: input.achievements || [],
    languageSkills: input.languageSkills || [],
    featuredProjects: input.featuredProjects || [],
    references: input.references || [],
  };
}

// Build CV data by merging profile with variation's experience customizations
function buildCVData(
  profile: {
    fullName: string;
    tagline: string | null;
    email: string;
    phone: string | null;
    location: string | null;
    photoUrl: string | null;
    summary: string | null;
    highlights: unknown;
    technicalSkills: unknown;
    experience: unknown;
    education: unknown;
    certifications: unknown;
    achievements: unknown;
    languageSkills: unknown;
    featuredProjects: unknown;
    references: unknown;
  },
  variation: {
    language: string;
    experience: unknown;
  }
) {
  const masterExperience = (profile.experience as ExperienceItem[]) || [];
  const variationExperience = (variation.experience as ExperienceVariation[]) || [];

  // Build experience by using variation overrides where available
  const experience = masterExperience.map((masterExp) => {
    const override = variationExperience.find((v) => v.masterId === masterExp.id);
    if (override && !override.hidden) {
      return {
        id: masterExp.id,
        title: override.title || masterExp.title,
        company: override.company || masterExp.company,
        startDate: override.startDate || masterExp.startDate,
        endDate: override.endDate ?? masterExp.endDate,
        current: masterExp.current,
        bullets: override.bullets.length > 0 ? override.bullets : masterExp.bullets,
      };
    }
    if (override?.hidden) {
      return null; // Hide this experience
    }
    return masterExp;
  }).filter(Boolean) as ExperienceItem[];

  return {
    language: variation.language as "EN" | "DE" | "RU" | "FR" | "AZ" | "UK" | "OTHER",
    fullName: profile.fullName,
    tagline: profile.tagline || "",
    email: profile.email,
    phone: profile.phone || "",
    location: profile.location || "",
    photoUrl: profile.photoUrl || "",
    summary: profile.summary || "",
    highlights: (profile.highlights as string[]) || [],
    technicalSkills: (profile.technicalSkills as SkillGroup[]) || [],
    experience,
    education: (profile.education as EducationItem[]) || [],
    certifications: (profile.certifications as CertificationItem[]) || [],
    achievements: (profile.achievements as AchievementItem[]) || [],
    languageSkills: (profile.languageSkills as LanguageSkillItem[]) || [],
    featuredProjects: (profile.featuredProjects as ProjectItem[]) || [],
    references: (profile.references as ReferenceItem[]) || [],
  };
}
