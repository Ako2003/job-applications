import { z } from "zod";

export const DOCUMENT_TYPE_OPTIONS = [
  { value: "COVER_LETTER", label: "Cover Letter" },
  { value: "RECOMMENDATION", label: "Recommendation" },
  { value: "PORTFOLIO", label: "Portfolio" },
  { value: "CERTIFICATE", label: "Certificate" },
] as const;

export const documentTypeEnum = z.enum([
  "COVER_LETTER",
  "RECOMMENDATION",
  "PORTFOLIO",
  "CERTIFICATE",
]);

export type DocumentType = z.infer<typeof documentTypeEnum>;

export const documentSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z.string().max(500).optional().or(z.literal("")),
  type: documentTypeEnum,
});

export type DocumentInput = z.infer<typeof documentSchema>;

export const documentUpdateSchema = documentSchema;

export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;

export function transformDocumentInput(input: DocumentInput) {
  return {
    name: input.name,
    description: input.description || null,
    type: input.type,
  };
}

export function getDocumentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}
