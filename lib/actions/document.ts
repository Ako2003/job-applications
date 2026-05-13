"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadDocument, deleteDocument } from "@/lib/storage";
import {
  documentSchema,
  documentUpdateSchema,
  transformDocumentInput,
} from "@/lib/validation/document";
import type { DocumentType } from "@prisma/client";

export async function getDocuments(filters?: { type?: string }) {
  const user = await requireUser();

  const where: { userId: string; type?: DocumentType } = {
    userId: user.id,
  };

  if (filters?.type) {
    where.type = filters.type as DocumentType;
  }

  return db.document.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      storageKey: true,
      fileSize: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { applications: true },
      },
    },
    orderBy: [{ type: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getDocument(id: string) {
  const user = await requireUser();

  return db.document.findUnique({
    where: { id, userId: user.id },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      storageKey: true,
      fileSize: true,
      contentType: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { applications: true },
      },
    },
  });
}

export type UploadDocumentState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function uploadDocumentAction(
  _prevState: UploadDocumentState,
  formData: FormData
): Promise<UploadDocumentState> {
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
    type: formData.get("type"),
  };

  const parsed = documentSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const metadata = transformDocumentInput(parsed.data);

  // Convert File to Buffer and upload to R2
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { key, size } = await uploadDocument(buffer, file.type, metadata.type);

    // Save to database
    await db.document.create({
      data: {
        ...metadata,
        userId: user.id,
        storageKey: key,
        fileSize: size,
        contentType: "application/pdf",
      },
    });

    revalidatePath("/documents");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to upload document" };
  }
}

export async function updateDocumentAction(
  id: string,
  _prevState: UploadDocumentState,
  formData: FormData
): Promise<UploadDocumentState> {
  const user = await requireUser();

  // Verify ownership
  const existing = await db.document.findUnique({
    where: { id, userId: user.id },
    select: { id: true, storageKey: true, type: true },
  });

  if (!existing) {
    return { error: "Document not found" };
  }

  // Validate metadata
  const rawInput = {
    name: formData.get("name"),
    description: formData.get("description"),
    type: formData.get("type"),
  };

  const parsed = documentUpdateSchema.safeParse(rawInput);

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

      const { key, size } = await uploadDocument(buffer, file.type, parsed.data.type);
      newStorageKey = key;
      newFileSize = size;

      // Delete old file
      await deleteDocument(existing.storageKey);
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: "Failed to upload document" };
    }
  }

  // Update database
  await db.document.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      type: parsed.data.type,
      ...(newStorageKey && {
        storageKey: newStorageKey,
        fileSize: newFileSize,
      }),
    },
  });

  revalidatePath("/documents");
  return { success: true };
}

export async function deleteDocumentAction(
  id: string
): Promise<{ error?: string }> {
  const user = await requireUser();

  // Verify ownership and check for applications
  const existing = await db.document.findUnique({
    where: { id, userId: user.id },
    select: {
      id: true,
      storageKey: true,
      _count: { select: { applications: true } },
    },
  });

  if (!existing) {
    return { error: "Document not found" };
  }

  if (existing._count.applications > 0) {
    return {
      error: `Cannot delete document linked to ${existing._count.applications} application(s). Unlink it from applications first.`,
    };
  }

  // Delete from R2
  try {
    await deleteDocument(existing.storageKey);
  } catch (error) {
    console.error("Failed to delete document from R2:", error);
    // Continue with database deletion even if R2 fails
  }

  // Delete from database
  await db.document.delete({ where: { id } });

  revalidatePath("/documents");
  return {};
}

// Get documents for select dropdown (grouped by type)
export async function getDocumentsForSelect() {
  const user = await requireUser();

  return db.document.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      type: true,
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}
