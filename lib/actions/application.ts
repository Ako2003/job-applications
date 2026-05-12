"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  applicationSchema,
  applicationEventSchema,
  statusUpdateSchema,
  transformApplicationInput,
  statusToEventType,
} from "@/lib/validation/application";
import type { ApplicationStatus, Prisma } from "@prisma/client";

export async function getApplications(filters?: {
  status?: string;
  source?: string;
  companyId?: string;
  cvTemplateId?: string;
  search?: string;
}) {
  const user = await requireUser();

  const where: Prisma.ApplicationWhereInput = {
    userId: user.id,
  };

  if (filters?.status) {
    where.status = filters.status as ApplicationStatus;
  }
  if (filters?.source) {
    where.source = filters.source as Prisma.EnumSourceFilter["equals"];
  }
  if (filters?.companyId) {
    where.companyId = filters.companyId;
  }
  if (filters?.cvTemplateId) {
    where.cvTemplateId = filters.cvTemplateId;
  }
  if (filters?.search) {
    where.OR = [
      { role: { contains: filters.search, mode: "insensitive" } },
      { notes: { contains: filters.search, mode: "insensitive" } },
      { company: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  return db.application.findMany({
    where,
    select: {
      id: true,
      role: true,
      status: true,
      source: true,
      location: true,
      remote: true,
      appliedAt: true,
      nextActionAt: true,
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      cvTemplate: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });
}

export async function getApplication(id: string) {
  const user = await requireUser();

  return db.application.findUnique({
    where: { id, userId: user.id },
    select: {
      id: true,
      role: true,
      jobUrl: true,
      source: true,
      sourceListingId: true,
      location: true,
      country: true,
      remote: true,
      employment: true,
      language: true,
      salaryMin: true,
      salaryMax: true,
      currency: true,
      coverLetter: true,
      status: true,
      appliedAt: true,
      nextActionAt: true,
      jobDescription: true,
      keyRequirements: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      company: {
        select: {
          id: true,
          name: true,
          website: true,
          industry: true,
        },
      },
      cvTemplate: {
        select: {
          id: true,
          name: true,
          language: true,
          storageKey: true,
        },
      },
      events: {
        select: {
          id: true,
          type: true,
          occurredAt: true,
          notes: true,
          createdAt: true,
        },
        orderBy: { occurredAt: "desc" },
      },
      contacts: {
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
        },
      },
    },
  });
}

export type ApplicationFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createApplication(
  _prevState: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  const user = await requireUser();

  const rawInput = {
    companyId: formData.get("companyId"),
    role: formData.get("role"),
    jobUrl: formData.get("jobUrl") || "",
    source: formData.get("source"),
    sourceListingId: formData.get("sourceListingId") || "",
    location: formData.get("location") || "",
    country: formData.get("country") || "",
    remote: formData.get("remote") || undefined,
    employment: formData.get("employment") || undefined,
    language: formData.get("language") || "EN",
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    currency: formData.get("currency") || "",
    cvTemplateId: formData.get("cvTemplateId") || "",
    coverLetter: formData.get("coverLetter") || "",
    status: formData.get("status") || "APPLIED",
    appliedAt: formData.get("appliedAt") || new Date().toISOString(),
    nextActionAt: formData.get("nextActionAt") || undefined,
    jobDescription: formData.get("jobDescription") || "",
    notes: formData.get("notes") || "",
  };

  const parsed = applicationSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = transformApplicationInput(parsed.data);

  // Create application with initial event in a transaction
  const application = await db.$transaction(async (tx) => {
    const app = await tx.application.create({
      data: {
        ...data,
        userId: user.id,
      },
      select: { id: true, status: true, appliedAt: true },
    });

    // Create initial "APPLIED" event
    await tx.applicationEvent.create({
      data: {
        applicationId: app.id,
        type: statusToEventType(app.status),
        occurredAt: app.appliedAt,
      },
    });

    return app;
  });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  redirect(`/applications/${application.id}`);
}

export async function updateApplication(
  id: string,
  _prevState: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  const user = await requireUser();

  // Verify ownership
  const existing = await db.application.findUnique({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Application not found" };
  }

  const rawInput = {
    companyId: formData.get("companyId"),
    role: formData.get("role"),
    jobUrl: formData.get("jobUrl") || "",
    source: formData.get("source"),
    sourceListingId: formData.get("sourceListingId") || "",
    location: formData.get("location") || "",
    country: formData.get("country") || "",
    remote: formData.get("remote") || undefined,
    employment: formData.get("employment") || undefined,
    language: formData.get("language") || "EN",
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    currency: formData.get("currency") || "",
    cvTemplateId: formData.get("cvTemplateId") || "",
    coverLetter: formData.get("coverLetter") || "",
    status: formData.get("status"),
    appliedAt: formData.get("appliedAt"),
    nextActionAt: formData.get("nextActionAt") || undefined,
    jobDescription: formData.get("jobDescription") || "",
    notes: formData.get("notes") || "",
  };

  const parsed = applicationSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = transformApplicationInput(parsed.data);

  await db.application.update({
    where: { id },
    data,
  });

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  revalidatePath("/dashboard");
  redirect(`/applications/${id}`);
}

export async function deleteApplication(
  id: string
): Promise<{ error?: string }> {
  const user = await requireUser();

  const existing = await db.application.findUnique({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Application not found" };
  }

  await db.application.delete({ where: { id } });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  redirect("/applications");
}

// Update status (creates event + updates cached status)
export async function updateApplicationStatus(
  id: string,
  status: string,
  notes?: string
): Promise<{ error?: string }> {
  const user = await requireUser();

  const parsed = statusUpdateSchema.safeParse({ status, notes });

  if (!parsed.success) {
    return { error: "Invalid status" };
  }

  const existing = await db.application.findUnique({
    where: { id, userId: user.id },
    select: { id: true, status: true },
  });

  if (!existing) {
    return { error: "Application not found" };
  }

  // Skip if status hasn't changed
  if (existing.status === parsed.data.status) {
    return {};
  }

  // Update status and create event in transaction
  await db.$transaction(async (tx) => {
    await tx.application.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    await tx.applicationEvent.create({
      data: {
        applicationId: id,
        type: statusToEventType(parsed.data.status),
        occurredAt: new Date(),
        notes: parsed.data.notes || null,
      },
    });
  });

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  revalidatePath("/dashboard");
  return {};
}

// Add an event to the timeline
export async function addApplicationEvent(
  applicationId: string,
  _prevState: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  const user = await requireUser();

  const existing = await db.application.findUnique({
    where: { id: applicationId, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Application not found" };
  }

  const rawInput = {
    type: formData.get("type"),
    occurredAt: formData.get("occurredAt") || new Date().toISOString(),
    notes: formData.get("notes"),
  };

  const parsed = applicationEventSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.applicationEvent.create({
    data: {
      applicationId,
      type: parsed.data.type,
      occurredAt: parsed.data.occurredAt,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath(`/applications/${applicationId}`);
  return {};
}

// Get companies for autocomplete
export async function getCompaniesForSelect() {
  const user = await requireUser();

  return db.company.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

// Get CV templates for select dropdown
export async function getCvTemplatesForSelect() {
  const user = await requireUser();

  return db.cVTemplate.findMany({
    where: { userId: user.id, isArchived: false },
    select: {
      id: true,
      name: true,
      language: true,
    },
    orderBy: { name: "asc" },
  });
}
