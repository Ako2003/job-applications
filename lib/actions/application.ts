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

const DEFAULT_ITEMS_PER_PAGE = 10;

export async function getApplications(filters?: {
  status?: string;
  source?: string;
  companyId?: string;
  cvTemplateId?: string;
  search?: string;
  sort?: string;
  order?: string;
  page?: number;
  perPage?: number | "all";
}) {
  const user = await requireUser();

  const page = filters?.page || 1;
  const perPage = filters?.perPage;
  const isShowAll = perPage === "all";
  const itemsPerPage = isShowAll ? undefined : (typeof perPage === "number" ? perPage : DEFAULT_ITEMS_PER_PAGE);
  const skip = isShowAll ? undefined : (page - 1) * (itemsPerPage || DEFAULT_ITEMS_PER_PAGE);

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

  // Build orderBy based on sort param
  const sortOrder: "asc" | "desc" = filters?.order === "asc" ? "asc" : "desc";
  let orderBy: Prisma.ApplicationOrderByWithRelationInput = { appliedAt: "desc" };

  switch (filters?.sort) {
    case "company":
      orderBy = { company: { name: sortOrder } };
      break;
    case "role":
      orderBy = { role: sortOrder };
      break;
    case "status":
      orderBy = { status: sortOrder };
      break;
    case "source":
      orderBy = { source: sortOrder };
      break;
    case "appliedAt":
      orderBy = { appliedAt: sortOrder };
      break;
  }

  const [applications, total] = await Promise.all([
    db.application.findMany({
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
      orderBy,
      skip,
      take: itemsPerPage,
    }),
    db.application.count({ where }),
  ]);

  return {
    applications,
    total,
    totalPages: isShowAll ? 1 : Math.ceil(total / (itemsPerPage || DEFAULT_ITEMS_PER_PAGE)),
    currentPage: isShowAll ? 1 : page,
    perPage: isShowAll ? "all" as const : (itemsPerPage || DEFAULT_ITEMS_PER_PAGE),
  };
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
      rejectedAt: true,
      rejectionReason: true,
      rejectionStage: true,
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
      documents: {
        select: {
          id: true,
          name: true,
          type: true,
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
    documentIds: formData.getAll("documentIds").filter(Boolean) as string[],
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

  const { documentIds, ...data } = transformApplicationInput(parsed.data);

  // Create application with initial event in a transaction
  const application = await db.$transaction(async (tx) => {
    const app = await tx.application.create({
      data: {
        ...data,
        userId: user.id,
        documents: documentIds.length > 0
          ? { connect: documentIds.map((id) => ({ id })) }
          : undefined,
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
    select: { id: true, documents: { select: { id: true } } },
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
    documentIds: formData.getAll("documentIds").filter(Boolean) as string[],
    coverLetter: formData.get("coverLetter") || "",
    status: formData.get("status"),
    appliedAt: formData.get("appliedAt"),
    nextActionAt: formData.get("nextActionAt") || undefined,
    rejectedAt: formData.get("rejectedAt") || undefined,
    rejectionReason: formData.get("rejectionReason") || "",
    rejectionStage: formData.get("rejectionStage") || "",
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

  const { documentIds, ...data } = transformApplicationInput(parsed.data);

  // Update application with document relations
  await db.application.update({
    where: { id },
    data: {
      ...data,
      documents: {
        disconnect: existing.documents.map((doc) => ({ id: doc.id })),
        connect: documentIds.map((docId) => ({ id: docId })),
      },
    },
  });

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
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

// Duplicate an application
export async function duplicateApplication(id: string): Promise<{ id?: string; error?: string }> {
  const user = await requireUser();

  const existing = await db.application.findUnique({
    where: { id, userId: user.id },
    select: {
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
      jobDescription: true,
      notes: true,
      companyId: true,
      cvTemplateId: true,
      documents: { select: { id: true } },
    },
  });

  if (!existing) {
    return { error: "Application not found" };
  }

  // Create duplicate with "Copy" suffix and today's date
  const duplicate = await db.$transaction(async (tx) => {
    const app = await tx.application.create({
      data: {
        userId: user.id,
        role: `${existing.role} (Copy)`,
        jobUrl: existing.jobUrl,
        source: existing.source,
        sourceListingId: null, // Reset listing ID
        location: existing.location,
        country: existing.country,
        remote: existing.remote,
        employment: existing.employment,
        language: existing.language,
        salaryMin: existing.salaryMin,
        salaryMax: existing.salaryMax,
        currency: existing.currency,
        coverLetter: existing.coverLetter,
        jobDescription: existing.jobDescription,
        notes: existing.notes,
        companyId: existing.companyId,
        cvTemplateId: existing.cvTemplateId,
        status: "APPLIED",
        appliedAt: new Date(),
        documents: existing.documents.length > 0
          ? { connect: existing.documents.map((doc) => ({ id: doc.id })) }
          : undefined,
      },
      select: { id: true, status: true, appliedAt: true },
    });

    // Create initial "APPLIED" event
    await tx.applicationEvent.create({
      data: {
        applicationId: app.id,
        type: "APPLIED",
        occurredAt: app.appliedAt,
      },
    });

    return app;
  });

  revalidatePath("/applications");
  revalidatePath("/dashboard");

  return { id: duplicate.id };
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
