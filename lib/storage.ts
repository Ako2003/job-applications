import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

// Create S3 client configured for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = env.R2_BUCKET;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SIGNED_URL_EXPIRY = 5 * 60; // 5 minutes

/**
 * Validates that the buffer is a PDF by checking magic bytes
 */
function isPdf(buffer: Buffer): boolean {
  // PDF files start with %PDF-
  return buffer.length >= 5 && buffer.subarray(0, 5).toString() === "%PDF-";
}

/**
 * Generates a unique storage key for a CV
 */
function generateStorageKey(): string {
  const id = crypto.randomUUID();
  return `cvs/${id}.pdf`;
}

export type UploadCvResult = {
  key: string;
  size: number;
};

/**
 * Uploads a CV PDF to R2
 * @param buffer - The file buffer
 * @param contentType - The content type (must be application/pdf)
 * @returns The storage key and file size
 * @throws Error if validation fails
 */
export async function uploadCv(
  buffer: Buffer,
  contentType: string
): Promise<UploadCvResult> {
  // Validate content type
  if (contentType !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  // Validate file size
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(
      `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  // Validate file content (check magic bytes)
  if (!isPdf(buffer)) {
    throw new Error("Invalid PDF file");
  }

  const key = generateStorageKey();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
    })
  );

  return {
    key,
    size: buffer.length,
  };
}

/**
 * Deletes a CV from R2
 * @param key - The storage key
 */
export async function deleteCv(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

/**
 * Gets a signed download URL for a CV
 * @param key - The storage key
 * @returns A signed URL valid for ~5 minutes
 */
export async function getCvDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: SIGNED_URL_EXPIRY,
  });

  return url;
}
