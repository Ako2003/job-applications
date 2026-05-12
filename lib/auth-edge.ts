/**
 * Edge-compatible auth utilities for middleware.
 * This module doesn't import Prisma or other heavy dependencies.
 */
import { jwtVerify } from "jose";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not defined");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Verify session token - Edge compatible (no Prisma)
 */
export async function verifySessionToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}
