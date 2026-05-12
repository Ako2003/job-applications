"use server";

import { timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, clearSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const signInSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type SignInState = {
  error?: string;
};

export async function signIn(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Password is required" };
  }

  const { password } = parsed.data;

  // Use timing-safe comparison to prevent timing attacks
  const passwordBuffer = Buffer.from(password);
  const appPasswordBuffer = Buffer.from(env.APP_PASSWORD);

  // Lengths must match for timingSafeEqual, so check first
  const passwordsMatch =
    passwordBuffer.length === appPasswordBuffer.length &&
    timingSafeEqual(passwordBuffer, appPasswordBuffer);

  if (!passwordsMatch) {
    return { error: "Invalid password" };
  }

  // Get the single user (there's only one)
  const user = await db.user.findFirst({
    select: { id: true },
  });

  if (!user) {
    return { error: "User not found. Please run the seed script." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  await clearSession();
  redirect("/login");
}
