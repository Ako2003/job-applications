"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApplicationStatus } from "@prisma/client";

// Status categories
const ACTIVE_STATUSES: ApplicationStatus[] = [
  "APPLIED",
  "SCREENING",
  "PHONE_INTERVIEW",
  "TECHNICAL_INTERVIEW",
  "ONSITE_FINAL",
];
const INTERVIEW_STATUSES: ApplicationStatus[] = [
  "PHONE_INTERVIEW",
  "TECHNICAL_INTERVIEW",
  "ONSITE_FINAL",
];

export async function getDashboardStats() {
  const user = await requireUser();

  const [total, active, interviews, offers] = await Promise.all([
    db.application.count({
      where: { userId: user.id },
    }),
    db.application.count({
      where: { userId: user.id, status: { in: ACTIVE_STATUSES } },
    }),
    db.application.count({
      where: { userId: user.id, status: { in: INTERVIEW_STATUSES } },
    }),
    db.application.count({
      where: { userId: user.id, status: "OFFER" },
    }),
  ]);

  return { total, active, interviews, offers };
}

export async function getFunnelData() {
  const user = await requireUser();

  // Get counts for each stage
  const [applied, screening, interview, final, offer] = await Promise.all([
    db.application.count({
      where: { userId: user.id },
    }),
    db.application.count({
      where: {
        userId: user.id,
        status: { in: ["SCREENING", "PHONE_INTERVIEW", "TECHNICAL_INTERVIEW", "ONSITE_FINAL", "OFFER"] },
      },
    }),
    db.application.count({
      where: {
        userId: user.id,
        status: { in: ["PHONE_INTERVIEW", "TECHNICAL_INTERVIEW", "ONSITE_FINAL", "OFFER"] },
      },
    }),
    db.application.count({
      where: {
        userId: user.id,
        status: { in: ["ONSITE_FINAL", "OFFER"] },
      },
    }),
    db.application.count({
      where: { userId: user.id, status: "OFFER" },
    }),
  ]);

  return [
    { stage: "Applied", count: applied },
    { stage: "Screening", count: screening },
    { stage: "Interview", count: interview },
    { stage: "Final", count: final },
    { stage: "Offer", count: offer },
  ];
}

export async function getResponseRateBySource() {
  const user = await requireUser();

  const applications = await db.application.groupBy({
    by: ["source"],
    where: { userId: user.id },
    _count: { id: true },
  });

  const responses = await db.application.groupBy({
    by: ["source"],
    where: {
      userId: user.id,
      status: { notIn: ["APPLIED", "DRAFT", "GHOSTED"] },
    },
    _count: { id: true },
  });

  const responseMap = new Map(
    responses.map((r) => [r.source, r._count.id])
  );

  return applications
    .map((app) => ({
      source: app.source,
      total: app._count.id,
      responses: responseMap.get(app.source) || 0,
      rate: Math.round(
        ((responseMap.get(app.source) || 0) / app._count.id) * 100
      ),
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getResponseRateByCv() {
  const user = await requireUser();

  const applications = await db.application.groupBy({
    by: ["cvTemplateId"],
    where: { userId: user.id, cvTemplateId: { not: null } },
    _count: { id: true },
  });

  const responses = await db.application.groupBy({
    by: ["cvTemplateId"],
    where: {
      userId: user.id,
      cvTemplateId: { not: null },
      status: { notIn: ["APPLIED", "DRAFT", "GHOSTED"] },
    },
    _count: { id: true },
  });

  // Get CV names
  const cvIds = applications
    .map((a) => a.cvTemplateId)
    .filter((id): id is string => id !== null);

  const cvTemplates = await db.cVTemplate.findMany({
    where: { id: { in: cvIds } },
    select: { id: true, name: true },
  });

  const cvNameMap = new Map(cvTemplates.map((cv) => [cv.id, cv.name]));
  const responseMap = new Map(
    responses.map((r) => [r.cvTemplateId, r._count.id])
  );

  return applications
    .map((app) => ({
      cvId: app.cvTemplateId!,
      cvName: cvNameMap.get(app.cvTemplateId!) || "Unknown",
      total: app._count.id,
      responses: responseMap.get(app.cvTemplateId) || 0,
      rate: Math.round(
        ((responseMap.get(app.cvTemplateId) || 0) / app._count.id) * 100
      ),
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getApplicationsOverTime() {
  const user = await requireUser();

  // Get applications from the last 12 weeks
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  const applications = await db.application.findMany({
    where: {
      userId: user.id,
      appliedAt: { gte: twelveWeeksAgo },
    },
    select: { appliedAt: true },
    orderBy: { appliedAt: "asc" },
  });

  // Group by week
  const weeklyData = new Map<string, number>();

  // Initialize all weeks
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekKey = getWeekKey(weekStart);
    weeklyData.set(weekKey, 0);
  }

  // Count applications per week
  applications.forEach((app) => {
    const weekKey = getWeekKey(app.appliedAt);
    weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + 1);
  });

  return Array.from(weeklyData.entries()).map(([week, count]) => ({
    week,
    count,
  }));
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  // Get Monday of the week
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export async function getTimeToFirstResponse() {
  const user = await requireUser();

  // Get applications that have received a response (moved past APPLIED)
  const applications = await db.application.findMany({
    where: {
      userId: user.id,
      status: { notIn: ["APPLIED", "DRAFT"] },
    },
    select: {
      appliedAt: true,
      events: {
        where: {
          type: { notIn: ["APPLIED", "NOTE", "FOLLOW_UP_SENT"] },
        },
        orderBy: { occurredAt: "asc" },
        take: 1,
        select: { occurredAt: true },
      },
    },
  });

  const responseTimes = applications
    .filter((app) => app.events.length > 0)
    .map((app) => {
      const applied = new Date(app.appliedAt).getTime();
      const response = new Date(app.events[0].occurredAt).getTime();
      return Math.floor((response - applied) / (1000 * 60 * 60 * 24)); // days
    })
    .sort((a, b) => a - b);

  if (responseTimes.length === 0) {
    return { median: null, count: 0 };
  }

  const mid = Math.floor(responseTimes.length / 2);
  const median =
    responseTimes.length % 2 === 0
      ? Math.round((responseTimes[mid - 1] + responseTimes[mid]) / 2)
      : responseTimes[mid];

  return { median, count: responseTimes.length };
}

export async function getRecentApplications() {
  const user = await requireUser();

  return db.application.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      role: true,
      status: true,
      appliedAt: true,
      company: {
        select: { name: true },
      },
    },
    orderBy: { appliedAt: "desc" },
    take: 5,
  });
}

export async function getApplicationsByCountry() {
  const user = await requireUser();

  const applications = await db.application.groupBy({
    by: ["country"],
    where: { userId: user.id, country: { not: null } },
    _count: { id: true },
  });

  return applications
    .filter((app) => app.country !== null)
    .map((app) => ({
      country: app.country!,
      count: app._count.id,
    }))
    .sort((a, b) => b.count - a.count);
}
