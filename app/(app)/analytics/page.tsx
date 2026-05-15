import Link from "next/link";
import {
  TrendingDown,
  Clock,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getRejectionStats,
  getRejectionReasons,
  getRejectionsByStage,
  getTimeToRejection,
  getRejectionsBySource,
  getRejectionsByCompanySize,
  getRejectionsOverTime,
  getRecentRejections,
  getApplicationsNeedingRejectionInfo,
} from "@/lib/actions/analytics";
import { SOURCE_OPTIONS } from "@/lib/validation/application";
import { RejectionReasonsChart } from "./rejection-reasons-chart";
import { RejectionStagesChart } from "./rejection-stages-chart";
import { TimeToRejectionChart } from "./time-to-rejection-chart";
import { RejectionsTimelineChart } from "./rejections-timeline-chart";
import { RejectionsBySourceChart } from "./rejections-by-source-chart";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getSourceLabel(source: string): string {
  return SOURCE_OPTIONS.find((s) => s.value === source)?.label ?? source;
}

export default async function AnalyticsPage() {
  const [
    stats,
    rejectionReasons,
    rejectionsByStage,
    timeToRejection,
    rejectionsBySource,
    rejectionsBySize,
    rejectionsOverTime,
    recentRejections,
    needingInfo,
  ] = await Promise.all([
    getRejectionStats(),
    getRejectionReasons(),
    getRejectionsByStage(),
    getTimeToRejection(),
    getRejectionsBySource(),
    getRejectionsByCompanySize(),
    getRejectionsOverTime(),
    getRecentRejections(),
    getApplicationsNeedingRejectionInfo(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Understand your application patterns and rejection insights
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalApplications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Rejections
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRejections}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Rejection Rate
            </CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.rejectionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Time to Rejection
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {timeToRejection.average !== null
                ? `${timeToRejection.average}d`
                : "—"}
            </div>
            {timeToRejection.median !== null && (
              <p className="text-xs text-muted-foreground">
                Median: {timeToRejection.median} days
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Missing info alert */}
      {needingInfo.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Rejections missing details
            </CardTitle>
            <CardDescription>
              Add rejection reasons to these applications for better insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {needingInfo.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <div>
                    <p className="font-medium">{app.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {app.company.name}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/applications/${app.id}/edit`}>
                      Add details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rejection reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Rejection Reasons</CardTitle>
            <CardDescription>Why applications are being rejected</CardDescription>
          </CardHeader>
          <CardContent>
            {rejectionReasons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No rejection reasons recorded yet.
              </p>
            ) : (
              <RejectionReasonsChart data={rejectionReasons} />
            )}
          </CardContent>
        </Card>

        {/* Rejection stages */}
        <Card>
          <CardHeader>
            <CardTitle>Rejection Stage</CardTitle>
            <CardDescription>At which stage rejections happen</CardDescription>
          </CardHeader>
          <CardContent>
            {rejectionsByStage.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No stage data recorded yet.
              </p>
            ) : (
              <RejectionStagesChart data={rejectionsByStage} />
            )}
          </CardContent>
        </Card>

        {/* Time to rejection */}
        <Card>
          <CardHeader>
            <CardTitle>Time to Rejection</CardTitle>
            <CardDescription>How quickly rejections come</CardDescription>
          </CardHeader>
          <CardContent>
            {timeToRejection.distribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No timing data available yet.
              </p>
            ) : (
              <TimeToRejectionChart data={timeToRejection.distribution} />
            )}
          </CardContent>
        </Card>

        {/* Rejections over time */}
        <Card>
          <CardHeader>
            <CardTitle>Rejections Over Time</CardTitle>
            <CardDescription>Weekly rejection count (last 12 weeks)</CardDescription>
          </CardHeader>
          <CardContent>
            <RejectionsTimelineChart data={rejectionsOverTime} />
          </CardContent>
        </Card>

        {/* Rejection rate by source */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Rejection Rate by Source</CardTitle>
            <CardDescription>Which job boards have highest rejection rates</CardDescription>
          </CardHeader>
          <CardContent>
            {rejectionsBySource.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No data available yet.
              </p>
            ) : (
              <RejectionsBySourceChart
                data={rejectionsBySource.map((r) => ({
                  ...r,
                  source: getSourceLabel(r.source),
                }))}
              />
            )}
          </CardContent>
        </Card>

        {/* Rejection rate by company size */}
        <Card>
          <CardHeader>
            <CardTitle>Rejection Rate by Company Size</CardTitle>
            <CardDescription>How company size affects outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            {rejectionsBySize.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No company size data available.
              </p>
            ) : (
              <div className="space-y-3">
                {rejectionsBySize.map((item) => (
                  <div key={item.size} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.size} employees</span>
                      <span className="text-muted-foreground">
                        {item.rejected}/{item.total} ({item.rate}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-destructive"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent rejections */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Rejections</CardTitle>
            <CardDescription>Latest rejected applications</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRejections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No rejections yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentRejections.slice(0, 5).map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{app.role}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.company.name}
                        </p>
                      </div>
                      {app.rejectionReason && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {app.rejectionReason}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      <span>Applied: {formatDate(app.appliedAt)}</span>
                      {app.rejectedAt && (
                        <span>Rejected: {formatDate(app.rejectedAt)}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
