"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
});

export type ProfileFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireUser();

  const rawInput = {
    name: formData.get("name"),
    email: formData.get("email"),
  };

  const parsed = profileSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Check if email is already taken by another user (not relevant for single-user app, but good practice)
  if (parsed.data.email !== user.email) {
    const existing = await db.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing && existing.id !== user.id) {
      return {
        error: "Email is already in use",
        fieldErrors: { email: ["Email is already in use"] },
      };
    }
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function getAccountStats() {
  const user = await requireUser();

  const [applications, companies, cvTemplates, contacts] = await Promise.all([
    db.application.count({ where: { userId: user.id } }),
    db.company.count({ where: { userId: user.id } }),
    db.cVTemplate.count({ where: { userId: user.id } }),
    db.contact.count({ where: { userId: user.id } }),
  ]);

  // Get status breakdown
  const statusCounts = await db.application.groupBy({
    by: ["status"],
    where: { userId: user.id },
    _count: { id: true },
  });

  return {
    applications,
    companies,
    cvTemplates,
    contacts,
    statusBreakdown: statusCounts.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
  };
}

export async function exportAllData() {
  const user = await requireUser();

  const [applications, companies, cvTemplates, contacts] = await Promise.all([
    db.application.findMany({
      where: { userId: user.id },
      include: {
        company: { select: { name: true } },
        cvTemplate: { select: { name: true } },
        events: true,
      },
    }),
    db.company.findMany({
      where: { userId: user.id },
    }),
    db.cVTemplate.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        description: true,
        language: true,
        version: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.contact.findMany({
      where: { userId: user.id },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    user: {
      email: user.email,
      name: user.name,
    },
    data: {
      applications,
      companies,
      cvTemplates,
      contacts,
    },
  };
}
