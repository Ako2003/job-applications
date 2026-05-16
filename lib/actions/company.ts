"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  companySchema,
  transformCompanyInput,
} from "@/lib/validation/company";

const DEFAULT_ITEMS_PER_PAGE = 10;

export async function getCompanies(options?: {
  sort?: string;
  order?: string;
  page?: number;
  perPage?: number | "all";
}) {
  const user = await requireUser();

  const page = options?.page || 1;
  const perPage = options?.perPage;
  const isShowAll = perPage === "all";
  const itemsPerPage = isShowAll ? undefined : (typeof perPage === "number" ? perPage : DEFAULT_ITEMS_PER_PAGE);
  const skip = isShowAll ? undefined : (page - 1) * (itemsPerPage || DEFAULT_ITEMS_PER_PAGE);

  // Build orderBy based on sort param
  const sortOrder: "asc" | "desc" = options?.order === "desc" ? "desc" : "asc";
  let orderBy: Prisma.CompanyOrderByWithRelationInput = { name: "asc" };

  switch (options?.sort) {
    case "name":
      orderBy = { name: sortOrder };
      break;
    case "industry":
      orderBy = { industry: sortOrder };
      break;
    case "location":
      orderBy = { hqCity: sortOrder };
      break;
    case "size":
      orderBy = { sizeBand: sortOrder };
      break;
    case "applications":
      orderBy = { applications: { _count: sortOrder } };
      break;
  }

  const [companies, total] = await Promise.all([
    db.company.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        website: true,
        industry: true,
        sizeBand: true,
        hqCity: true,
        hqCountry: true,
        createdAt: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy,
      skip,
      take: itemsPerPage,
    }),
    db.company.count({ where: { userId: user.id } }),
  ]);

  return {
    companies,
    total,
    totalPages: isShowAll ? 1 : Math.ceil(total / (itemsPerPage || DEFAULT_ITEMS_PER_PAGE)),
    currentPage: isShowAll ? 1 : page,
    perPage: isShowAll ? "all" as const : (itemsPerPage || DEFAULT_ITEMS_PER_PAGE),
  };
}

export async function getCompany(id: string) {
  const user = await requireUser();

  return db.company.findUnique({
    where: { id, userId: user.id },
    select: {
      id: true,
      name: true,
      website: true,
      industry: true,
      sizeBand: true,
      hqCity: true,
      hqCountry: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      applications: {
        select: {
          id: true,
          role: true,
          status: true,
          appliedAt: true,
        },
        orderBy: { appliedAt: "desc" },
      },
      contacts: {
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
        },
        orderBy: { name: "asc" },
      },
    },
  });
}

export type CreateCompanyState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createCompany(
  _prevState: CreateCompanyState,
  formData: FormData
): Promise<CreateCompanyState> {
  const user = await requireUser();

  const rawInput = {
    name: formData.get("name"),
    website: formData.get("website"),
    industry: formData.get("industry"),
    sizeBand: formData.get("sizeBand"),
    hqCity: formData.get("hqCity"),
    hqCountry: formData.get("hqCountry"),
    notes: formData.get("notes"),
  };

  const parsed = companySchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = transformCompanyInput(parsed.data);

  try {
    const company = await db.company.create({
      data: {
        ...data,
        userId: user.id,
      },
      select: { id: true },
    });

    revalidatePath("/companies");
    redirect(`/companies/${company.id}`);
  } catch (error) {
    // Check for unique constraint violation
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return {
        error: "A company with this name already exists",
      };
    }
    throw error;
  }
}

export async function updateCompany(
  id: string,
  _prevState: CreateCompanyState,
  formData: FormData
): Promise<CreateCompanyState> {
  const user = await requireUser();

  const rawInput = {
    name: formData.get("name"),
    website: formData.get("website"),
    industry: formData.get("industry"),
    sizeBand: formData.get("sizeBand"),
    hqCity: formData.get("hqCity"),
    hqCountry: formData.get("hqCountry"),
    notes: formData.get("notes"),
  };

  const parsed = companySchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = transformCompanyInput(parsed.data);

  // Verify ownership
  const existing = await db.company.findUnique({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Company not found" };
  }

  try {
    await db.company.update({
      where: { id },
      data,
    });

    revalidatePath("/companies");
    revalidatePath(`/companies/${id}`);
    redirect(`/companies/${id}`);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return {
        error: "A company with this name already exists",
      };
    }
    throw error;
  }
}

export async function deleteCompany(id: string): Promise<{ error?: string }> {
  const user = await requireUser();

  // Verify ownership
  const existing = await db.company.findUnique({
    where: { id, userId: user.id },
    select: {
      id: true,
      _count: { select: { applications: true } },
    },
  });

  if (!existing) {
    return { error: "Company not found" };
  }

  if (existing._count.applications > 0) {
    return {
      error: `Cannot delete company with ${existing._count.applications} application(s). Delete the applications first.`,
    };
  }

  await db.company.delete({ where: { id } });

  revalidatePath("/companies");
  redirect("/companies");
}
