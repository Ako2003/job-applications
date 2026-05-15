"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getRejectionStats() {
  const user = await requireUser();

  const [totalApplications, totalRejections] = await Promise.all([
    db.application.count({ where: { userId: user.id } }),
    db.application.count({ where: { userId: user.id, status: "REJECTED" } }),
  ]);

  const rejectionRate = totalApplications > 0
    ? Math.round((totalRejections / totalApplications) * 100)
    : 0;

  return {
    totalApplications,
    totalRejections,
    rejectionRate,
  };
}

export async function getRejectionReasons() {
  const user = await requireUser();

  const applications = await db.application.findMany({
    where: {
      userId: user.id,
      status: "REJECTED",
      rejectionReason: { not: null },
    },
    select: { rejectionReason: true },
  });

  // Group by reason
  const reasonCounts = new Map<string, number>();
  applications.forEach((app) => {
    const reason = app.rejectionReason || "Unknown";
    reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
  });

  // Also count rejections without a reason
  const withoutReason = await db.application.count({
    where: {
      userId: user.id,
      status: "REJECTED",
      rejectionReason: null,
    },
  });

  if (withoutReason > 0) {
    reasonCounts.set("Not specified", withoutReason);
  }

  return Array.from(reasonCounts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getRejectionsByStage() {
  const user = await requireUser();

  const applications = await db.application.findMany({
    where: {
      userId: user.id,
      status: "REJECTED",
    },
    select: { rejectionStage: true },
  });

  // Group by stage
  const stageCounts = new Map<string, number>();
  applications.forEach((app) => {
    const stage = app.rejectionStage || "Application";
    stageCounts.set(stage, (stageCounts.get(stage) || 0) + 1);
  });

  return Array.from(stageCounts.entries())
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getTimeToRejection() {
  const user = await requireUser();

  const applications = await db.application.findMany({
    where: {
      userId: user.id,
      status: "REJECTED",
      rejectedAt: { not: null },
    },
    select: {
      appliedAt: true,
      rejectedAt: true,
    },
  });

  if (applications.length === 0) {
    return { average: null, median: null, distribution: [] };
  }

  const daysToRejection = applications
    .filter((app) => app.rejectedAt)
    .map((app) => {
      const applied = new Date(app.appliedAt).getTime();
      const rejected = new Date(app.rejectedAt!).getTime();
      return Math.floor((rejected - applied) / (1000 * 60 * 60 * 24));
    })
    .sort((a, b) => a - b);

  if (daysToRejection.length === 0) {
    return { average: null, median: null, distribution: [] };
  }

  const average = Math.round(
    daysToRejection.reduce((a, b) => a + b, 0) / daysToRejection.length
  );

  const mid = Math.floor(daysToRejection.length / 2);
  const median = daysToRejection.length % 2 === 0
    ? Math.round((daysToRejection[mid - 1] + daysToRejection[mid]) / 2)
    : daysToRejection[mid];

  // Create distribution buckets
  const distribution = [
    { range: "Same day", count: daysToRejection.filter((d) => d === 0).length },
    { range: "1-3 days", count: daysToRejection.filter((d) => d >= 1 && d <= 3).length },
    { range: "4-7 days", count: daysToRejection.filter((d) => d >= 4 && d <= 7).length },
    { range: "1-2 weeks", count: daysToRejection.filter((d) => d >= 8 && d <= 14).length },
    { range: "2-4 weeks", count: daysToRejection.filter((d) => d >= 15 && d <= 28).length },
    { range: "1-2 months", count: daysToRejection.filter((d) => d >= 29 && d <= 60).length },
    { range: "2+ months", count: daysToRejection.filter((d) => d > 60).length },
  ].filter((d) => d.count > 0);

  return { average, median, distribution };
}

export async function getRejectionsBySource() {
  const user = await requireUser();

  const [allBySource, rejectedBySource] = await Promise.all([
    db.application.groupBy({
      by: ["source"],
      where: { userId: user.id },
      _count: { id: true },
    }),
    db.application.groupBy({
      by: ["source"],
      where: { userId: user.id, status: "REJECTED" },
      _count: { id: true },
    }),
  ]);

  const rejectedMap = new Map(
    rejectedBySource.map((r) => [r.source, r._count.id])
  );

  return allBySource
    .map((item) => ({
      source: item.source,
      total: item._count.id,
      rejected: rejectedMap.get(item.source) || 0,
      rate: Math.round(
        ((rejectedMap.get(item.source) || 0) / item._count.id) * 100
      ),
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getRejectionsByCompanySize() {
  const user = await requireUser();

  const applications = await db.application.findMany({
    where: { userId: user.id },
    select: {
      status: true,
      company: { select: { sizeBand: true } },
    },
  });

  // Group by company size
  const sizeStats = new Map<string, { total: number; rejected: number }>();

  applications.forEach((app) => {
    const size = app.company.sizeBand || "Unknown";
    const current = sizeStats.get(size) || { total: 0, rejected: 0 };
    current.total++;
    if (app.status === "REJECTED") {
      current.rejected++;
    }
    sizeStats.set(size, current);
  });

  // Define size order for sorting
  const sizeOrder = ["1-10", "11-50", "51-200", "201-1000", "1000+", "Unknown"];

  return Array.from(sizeStats.entries())
    .map(([size, stats]) => ({
      size,
      total: stats.total,
      rejected: stats.rejected,
      rate: Math.round((stats.rejected / stats.total) * 100),
    }))
    .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size));
}

export async function getRejectionsOverTime() {
  const user = await requireUser();

  // Get rejections from last 12 weeks
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  const rejections = await db.application.findMany({
    where: {
      userId: user.id,
      status: "REJECTED",
      rejectedAt: { gte: twelveWeeksAgo },
    },
    select: { rejectedAt: true },
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

  // Count rejections per week
  rejections.forEach((app) => {
    if (app.rejectedAt) {
      const weekKey = getWeekKey(app.rejectedAt);
      if (weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + 1);
      }
    }
  });

  return Array.from(weeklyData.entries()).map(([week, count]) => ({
    week,
    count,
  }));
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export async function getRecentRejections() {
  const user = await requireUser();

  return db.application.findMany({
    where: { userId: user.id, status: "REJECTED" },
    select: {
      id: true,
      role: true,
      rejectionReason: true,
      rejectionStage: true,
      appliedAt: true,
      rejectedAt: true,
      company: { select: { name: true } },
    },
    orderBy: { rejectedAt: "desc" },
    take: 10,
  });
}

export async function getApplicationsNeedingRejectionInfo() {
  const user = await requireUser();

  return db.application.findMany({
    where: {
      userId: user.id,
      status: "REJECTED",
      OR: [
        { rejectionReason: null },
        { rejectedAt: null },
      ],
    },
    select: {
      id: true,
      role: true,
      appliedAt: true,
      company: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });
}
