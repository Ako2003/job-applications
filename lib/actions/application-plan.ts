"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  applicationPlanSchema,
  transformApplicationPlanInput,
} from "@/lib/validation/application-plan";

// Country name to ISO code mapping (and common variations)
const COUNTRY_MAPPINGS: Record<string, string[]> = {
  "Germany": ["DE", "Germany", "deutschland", "de"],
  "Netherlands": ["NL", "Netherlands", "nl", "holland"],
  "Austria": ["AT", "Austria", "at"],
  "Switzerland": ["CH", "Switzerland", "ch"],
  "Belgium": ["BE", "Belgium", "be"],
  "Luxembourg": ["LU", "Luxembourg", "lu"],
  "France": ["FR", "France", "fr"],
  "UK": ["GB", "UK", "United Kingdom", "gb", "uk"],
  "Ireland": ["IE", "Ireland", "ie"],
  "Sweden": ["SE", "Sweden", "se"],
  "Denmark": ["DK", "Denmark", "dk"],
  "Norway": ["NO", "Norway", "no"],
  "Finland": ["FI", "Finland", "fi"],
  "Poland": ["PL", "Poland", "pl"],
  "Czech Republic": ["CZ", "Czech Republic", "cz", "czechia"],
  "Estonia": ["EE", "Estonia", "ee"],
  "Spain": ["ES", "Spain", "es"],
  "Portugal": ["PT", "Portugal", "pt"],
  "Italy": ["IT", "Italy", "it"],
  "USA": ["US", "USA", "United States", "us"],
  "Canada": ["CA", "Canada", "ca"],
  "Singapore": ["SG", "Singapore", "sg"],
  "UAE": ["AE", "UAE", "United Arab Emirates", "ae"],
  "Remote": ["Remote", "remote", "Worldwide"],
};

// Get all possible codes/names for a country
function getCountryVariants(country: string): string[] {
  const variants = COUNTRY_MAPPINGS[country];
  if (variants) {
    return variants.map(v => v.toLowerCase());
  }
  // If not in mapping, return the country itself (lowercase)
  return [country.toLowerCase()];
}

// Check if an application country matches a plan country
function matchesCountry(appCountry: string, planCountry: string): boolean {
  const variants = getCountryVariants(planCountry);
  return variants.includes(appCountry.toLowerCase());
}

export async function getApplicationPlans() {
  const user = await requireUser();

  // Get all plans
  const plans = await db.applicationPlan.findMany({
    where: { userId: user.id },
    orderBy: [{ isActive: "desc" }, { country: "asc" }],
  });

  if (plans.length === 0) {
    return [];
  }

  // Get all applications with country in a single query
  const applications = await db.application.findMany({
    where: {
      userId: user.id,
      country: { not: null },
    },
    select: {
      country: true,
      appliedAt: true,
    },
  });

  // Calculate stats for each plan by matching applications to plan countries
  const now = new Date();
  const plansWithStats = plans.map((plan) => {
    // Find all applications that match this plan's country
    const matchingApps = applications.filter(
      (app) => app.country && matchesCountry(app.country, plan.country)
    );

    // Count applications since plan started
    const totalApplications = matchingApps.filter(
      (app) => app.appliedAt >= plan.startedAt
    ).length;

    // Calculate weeks since started
    const diffTime = Math.abs(now.getTime() - plan.startedAt.getTime());
    const diffWeeks = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)));

    // Calculate actual apps per week
    const actualAppsPerWeek = Math.round((totalApplications / diffWeeks) * 10) / 10;

    return {
      ...plan,
      totalApplications,
      weeksActive: diffWeeks,
      actualAppsPerWeek,
    };
  });

  return plansWithStats;
}

export async function getApplicationPlan(id: string) {
  const user = await requireUser();

  return db.applicationPlan.findUnique({
    where: { id, userId: user.id },
  });
}

export type ApplicationPlanFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createApplicationPlan(
  _prevState: ApplicationPlanFormState,
  formData: FormData
): Promise<ApplicationPlanFormState> {
  const user = await requireUser();

  const rawInput = {
    country: formData.get("country"),
    appsPerWeek: formData.get("appsPerWeek"),
    platform: formData.get("platform"),
    startedAt: formData.get("startedAt") || undefined,
    isActive: formData.get("isActive") === "true",
    notes: formData.get("notes") || "",
  };

  const parsed = applicationPlanSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = transformApplicationPlanInput(parsed.data);

  try {
    await db.applicationPlan.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    revalidatePath("/application-plan");
    redirect("/application-plan");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return {
        error: "A plan for this country and platform combination already exists",
      };
    }
    throw error;
  }
}

export async function updateApplicationPlan(
  id: string,
  _prevState: ApplicationPlanFormState,
  formData: FormData
): Promise<ApplicationPlanFormState> {
  const user = await requireUser();

  const existing = await db.applicationPlan.findUnique({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Plan not found" };
  }

  const rawInput = {
    country: formData.get("country"),
    appsPerWeek: formData.get("appsPerWeek"),
    platform: formData.get("platform"),
    startedAt: formData.get("startedAt") || undefined,
    isActive: formData.get("isActive") === "true",
    notes: formData.get("notes") || "",
  };

  const parsed = applicationPlanSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = transformApplicationPlanInput(parsed.data);

  try {
    await db.applicationPlan.update({
      where: { id },
      data,
    });

    revalidatePath("/application-plan");
    redirect("/application-plan");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return {
        error: "A plan for this country and platform combination already exists",
      };
    }
    throw error;
  }
}

export async function deleteApplicationPlan(id: string): Promise<{ error?: string }> {
  const user = await requireUser();

  const existing = await db.applicationPlan.findUnique({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Plan not found" };
  }

  await db.applicationPlan.delete({ where: { id } });

  revalidatePath("/application-plan");
  redirect("/application-plan");
}

export async function toggleApplicationPlanActive(id: string): Promise<{ error?: string }> {
  const user = await requireUser();

  const existing = await db.applicationPlan.findUnique({
    where: { id, userId: user.id },
    select: { id: true, isActive: true },
  });

  if (!existing) {
    return { error: "Plan not found" };
  }

  await db.applicationPlan.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  revalidatePath("/application-plan");
  return {};
}

// Get application stats by country for dashboard
export async function getApplicationStatsByCountry() {
  const user = await requireUser();

  const now = new Date();

  // Start of this week (Monday)
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  const dayOfWeek = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  // Start of this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all applications with country
  const applications = await db.application.findMany({
    where: {
      userId: user.id,
      country: { not: null },
    },
    select: {
      country: true,
      appliedAt: true,
    },
  });

  // Group by country
  const countryStats: Record<string, { week: number; month: number; allTime: number }> = {};

  for (const app of applications) {
    const country = app.country!;
    if (!countryStats[country]) {
      countryStats[country] = { week: 0, month: 0, allTime: 0 };
    }

    countryStats[country].allTime++;

    if (app.appliedAt >= startOfMonth) {
      countryStats[country].month++;
    }

    if (app.appliedAt >= startOfWeek) {
      countryStats[country].week++;
    }
  }

  // Convert to array and sort by all-time count
  return Object.entries(countryStats)
    .map(([country, stats]) => ({
      country,
      ...stats,
    }))
    .sort((a, b) => b.allTime - a.allTime);
}
