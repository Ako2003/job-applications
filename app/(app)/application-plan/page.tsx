import Link from "next/link";
import { Plus, Target, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getApplicationPlans } from "@/lib/actions/application-plan";
import { PlanActions } from "./plan-actions";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatDuration(weeks: number): string {
  if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? "" : "s"}`;
  }
  const months = Math.floor(weeks / 4);
  const remainingWeeks = weeks % 4;
  if (remainingWeeks === 0) {
    return `${months} month${months === 1 ? "" : "s"}`;
  }
  return `${months}m ${remainingWeeks}w`;
}

function getPerformanceIndicator(actual: number, target: number) {
  const ratio = actual / target;
  if (ratio >= 1) {
    return { icon: TrendingUp, color: "text-green-600", label: "On track" };
  } else if (ratio >= 0.7) {
    return { icon: Minus, color: "text-yellow-600", label: "Slightly behind" };
  } else {
    return { icon: TrendingDown, color: "text-red-600", label: "Behind" };
  }
}

export default async function ApplicationPlanPage() {
  const plans = await getApplicationPlans();

  const activePlans = plans.filter((p) => p.isActive);
  const inactivePlans = plans.filter((p) => !p.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Application Plan
          </h1>
          <p className="text-muted-foreground">
            Plan your weekly application targets by country and platform
          </p>
        </div>
        <Button asChild>
          <Link href="/application-plan/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Plan
          </Link>
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Target className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No plans yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a plan to track your application targets.
          </p>
          <Button asChild className="mt-4">
            <Link href="/application-plan/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {activePlans.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Active Plans</h2>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead className="text-center">Target/Week</TableHead>
                      <TableHead className="text-center">Actual/Week</TableHead>
                      <TableHead className="text-center">Total Apps</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activePlans.map((plan) => {
                      const performance = getPerformanceIndicator(
                        plan.actualAppsPerWeek,
                        plan.appsPerWeek
                      );
                      const PerformanceIcon = performance.icon;

                      return (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">
                            {plan.country}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{plan.platform}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{plan.appsPerWeek}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className={performance.color}>
                                {plan.actualAppsPerWeek}
                              </span>
                              <PerformanceIcon
                                className={`h-4 w-4 ${performance.color}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge>{plan.totalApplications}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDuration(plan.weeksActive)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(plan.startedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <PlanActions plan={plan} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {inactivePlans.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">
                Inactive Plans
              </h2>
              <div className="rounded-lg border opacity-75">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead className="text-center">Target/Week</TableHead>
                      <TableHead className="text-center">Total Apps</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inactivePlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">
                          {plan.country}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{plan.platform}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {plan.appsPerWeek}
                        </TableCell>
                        <TableCell className="text-center">
                          {plan.totalApplications}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDuration(plan.weeksActive)}
                        </TableCell>
                        <TableCell className="text-right">
                          <PlanActions plan={plan} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
