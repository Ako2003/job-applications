"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  companySchema,
  transformCompanyInput,
} from "@/lib/validation/company";

export async function getCompanies() {
  const user = await requireUser();

  return db.company.findMany({
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
    orderBy: { name: "asc" },
  });
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
