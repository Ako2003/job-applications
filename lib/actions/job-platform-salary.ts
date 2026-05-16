"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  jobPlatformSalarySchema,
  type JobPlatformSalaryInput,
} from "@/lib/validation/job-platform-salary";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// Get all job platform salary entries for the user
export async function getJobPlatformSalaries() {
  const user = await requireUser();

  return db.jobPlatformSalary.findMany({
    where: { userId: user.id },
    orderBy: [{ country: "asc" }, { platform: "asc" }],
  });
}

// Get a single entry
export async function getJobPlatformSalary(id: string) {
  const user = await requireUser();

  return db.jobPlatformSalary.findFirst({
    where: { id, userId: user.id },
  });
}

// Create a new entry
export async function createJobPlatformSalary(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const rawInput = extractFormData(formData);
  const parsed = jobPlatformSalarySchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.jobPlatformSalary.create({
    data: {
      userId: user.id,
      country: parsed.data.country,
      platform: parsed.data.platform,
      url: parsed.data.url || null,
      salaryMinAnnual: parsed.data.salaryMinAnnual || null,
      salaryMaxAnnual: parsed.data.salaryMaxAnnual || null,
      currency: parsed.data.currency,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/salary-info");
  return {};
}

// Update an entry
export async function updateJobPlatformSalary(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const existing = await db.jobPlatformSalary.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Entry not found" };
  }

  const rawInput = extractFormData(formData);
  const parsed = jobPlatformSalarySchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.jobPlatformSalary.update({
    where: { id },
    data: {
      country: parsed.data.country,
      platform: parsed.data.platform,
      url: parsed.data.url || null,
      salaryMinAnnual: parsed.data.salaryMinAnnual || null,
      salaryMaxAnnual: parsed.data.salaryMaxAnnual || null,
      currency: parsed.data.currency,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/salary-info");
  return {};
}

// Delete an entry
export async function deleteJobPlatformSalary(id: string): Promise<{ error?: string }> {
  const user = await requireUser();

  const existing = await db.jobPlatformSalary.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Entry not found" };
  }

  await db.jobPlatformSalary.delete({ where: { id } });

  revalidatePath("/salary-info");
  return {};
}

function extractFormData(formData: FormData): JobPlatformSalaryInput {
  return {
    country: (formData.get("country") as string) || "",
    platform: (formData.get("platform") as string) || "",
    url: (formData.get("url") as string) || "",
    salaryMinAnnual: formData.get("salaryMinAnnual")
      ? parseInt(formData.get("salaryMinAnnual") as string, 10)
      : undefined,
    salaryMaxAnnual: formData.get("salaryMaxAnnual")
      ? parseInt(formData.get("salaryMaxAnnual") as string, 10)
      : undefined,
    currency: (formData.get("currency") as string) || "EUR",
    notes: (formData.get("notes") as string) || "",
  };
}
