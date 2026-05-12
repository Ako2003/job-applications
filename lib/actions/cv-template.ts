"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadCv, deleteCv } from "@/lib/storage";
import {
  cvTemplateSchema,
  cvTemplateUpdateSchema,
  transformCvTemplateInput,
} from "@/lib/validation/cv-template";

export async function getCvTemplates() {
  const user = await requireUser();

  return db.cVTemplate.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      description: true,
      language: true,
      storageKey: true,
      fileSize: true,
      version: true,
      isArchived: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { applications: true },
      },
    },
    orderBy: [{ isArchived: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getCvTemplate(id: string) {
  const user = await requireUser();

  return db.cVTemplate.findUnique({
    where: { id, userId: user.id },
    select: {
      id: true,
      name: true,
      description: true,
      language: true,
      storageKey: true,
      fileSize: true,
      contentType: true,
      version: true,
      isArchived: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { applications: true },
      },
    },
  });
}

export type UploadCvTemplateState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function uploadCvTemplate(
  _prevState: UploadCvTemplateState,
  formData: FormData
): Promise<UploadCvTemplateState> {
  const user = await requireUser();

  // Get the file
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { error: "Please select a PDF file to upload" };
  }

  // Validate metadata
  const rawInput = {
    name: formData.get("name"),
    description: formData.get("description"),
    language: formData.get("language"),
  };

  const parsed = cvTemplateSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const metadata = transformCvTemplateInput(parsed.data);

  // Convert File to Buffer and upload to R2
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { key, size } = await uploadCv(buffer, file.type);

    // Save to database
    await db.cVTemplate.create({
      data: {
        ...metadata,
        userId: user.id,
        storageKey: key,
        fileSize: size,
        contentType: "application/pdf",
      },
    });

    revalidatePath("/cvs");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to upload CV" };
  }
}

export async function updateCvTemplate(
  id: string,
  _prevState: UploadCvTemplateState,
  formData: FormData
): Promise<UploadCvTemplateState> {
  const user = await requireUser();

  // Verify ownership
  const existing = await db.cVTemplate.findUnique({
    where: { id, userId: user.id },
    select: { id: true, storageKey: true, version: true },
  });

  if (!existing) {
    return { error: "CV template not found" };
  }

  // Validate metadata
  const rawInput = {
    name: formData.get("name"),
    description: formData.get("description"),
    language: formData.get("language"),
    isArchived: formData.get("isArchived") === "true",
  };

  const parsed = cvTemplateUpdateSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Check if there's a new file to upload
  const file = formData.get("file") as File | null;
  let newStorageKey: string | undefined;
  let newFileSize: number | undefined;

  if (file && file.size > 0) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { key, size } = await uploadCv(buffer, file.type);
      newStorageKey = key;
      newFileSize = size;

      // Delete old file
      await deleteCv(existing.storageKey);
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: "Failed to upload CV" };
    }
  }

  // Update database
  await db.cVTemplate.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      language: parsed.data.language,
      isArchived: parsed.data.isArchived ?? false,
      ...(newStorageKey && {
        storageKey: newStorageKey,
        fileSize: newFileSize,
        version: existing.version + 1,
      }),
    },
  });

  revalidatePath("/cvs");
  return { success: true };
}

export async function deleteCvTemplate(
  id: string
): Promise<{ error?: string }> {
  const user = await requireUser();

  // Verify ownership and check for applications
  const existing = await db.cVTemplate.findUnique({
    where: { id, userId: user.id },
    select: {
      id: true,
      storageKey: true,
      _count: { select: { applications: true } },
    },
  });

  if (!existing) {
    return { error: "CV template not found" };
  }

  if (existing._count.applications > 0) {
    return {
      error: `Cannot delete CV template used by ${existing._count.applications} application(s). Archive it instead.`,
    };
  }

  // Delete from R2
  try {
    await deleteCv(existing.storageKey);
  } catch (error) {
    console.error("Failed to delete CV from R2:", error);
    // Continue with database deletion even if R2 fails
  }

  // Delete from database
  await db.cVTemplate.delete({ where: { id } });

  revalidatePath("/cvs");
  return {};
}

export async function archiveCvTemplate(
  id: string,
  isArchived: boolean
): Promise<{ error?: string }> {
  const user = await requireUser();

  // Verify ownership
  const existing = await db.cVTemplate.findUnique({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "CV template not found" };
  }

  await db.cVTemplate.update({
    where: { id },
    data: { isArchived },
  });

  revalidatePath("/cvs");
  return {};
}
