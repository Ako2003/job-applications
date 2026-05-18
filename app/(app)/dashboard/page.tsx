import Link from "next/link";
import {
  FileText,
  TrendingUp,
  Users,
  Trophy,
  Clock,
  ArrowRight,
  CalendarCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/app/status-badge";
import {
  getDashboardStats,
  getFunnelData,
  getResponseRateBySource,
  getResponseRateByCv,
  getApplicationsOverTime,
  getTimeToFirstResponse,
  getRecentApplications,
  getApplicationsByCountry,
} from "@/lib/actions/dashboard";
import { getApplicationsAppliedToday } from "@/lib/actions/application";
import { getApplicationStatsByCountry } from "@/lib/actions/application-plan";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { SOURCE_OPTIONS } from "@/lib/validation/application";
import { FunnelChart } from "./funnel-chart";
import { TimelineChart } from "./timeline-chart";
import { ResponseRateChart } from "./response-rate-chart";
import { CountryChart } from "./country-chart";

function getSourceLabel(source: string): string {
  return SOURCE_OPTIONS.find((s) => s.value === source)?.label ?? source;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [
    stats,
    funnelData,
    responseBySource,
    responseByCv,
    timelineData,
    timeToResponse,
    recentApplications,
    countryData,
    appliedToday,
    countryStats,
  ] = await Promise.all([
    getDashboardStats(),
    getFunnelData(),
    getResponseRateBySource(),
    getResponseRateByCv(),
    getApplicationsOverTime(),
    getTimeToFirstResponse(),
    getRecentApplications(),
    getApplicationsByCountry(),
    getApplicationsAppliedToday(),
    getApplicationStatsByCountry(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/applications/new">
            <FileText className="mr-2 h-4 w-4" />
            New Application
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-4 rounded-full bg-chart-2/10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Applied Today
            </CardTitle>
            <div className="rounded-lg bg-chart-2/10 p-2">
              <CalendarCheck className="h-4 w-4 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appliedToday}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-4 rounded-full bg-primary/10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-4 rounded-full bg-chart-3/10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="rounded-lg bg-chart-3/10 p-2">
              <TrendingUp className="h-4 w-4 text-chart-3" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Not rejected/withdrawn/ghosted
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-4 rounded-full bg-chart-4/10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <div className="rounded-lg bg-chart-4/10 p-2">
              <Users className="h-4 w-4 text-chart-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.interviews}</div>
            <p className="text-xs text-muted-foreground">
              In interview stages
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-4 rounded-full bg-accent/10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Offers</CardTitle>
            <div className="rounded-lg bg-accent/10 p-2">
              <Trophy className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.offers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Time to response */}
      {timeToResponse.median !== null && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Median Time to First Response
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeToResponse.median} days</div>
            <p className="text-xs text-muted-foreground">
              Based on {timeToResponse.count} applications with responses
            </p>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Application Funnel</CardTitle>
            <CardDescription>
              Progression through application stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <p className="text-sm text-muted-foreground">
                No applications yet.
              </p>
            ) : (
              <FunnelChart data={funnelData} />
            )}
          </CardContent>
        </Card>

        {/* Applications over time */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Over Time</CardTitle>
            <CardDescription>Weekly application count (last 12 weeks)</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <p className="text-sm text-muted-foreground">
                No applications yet.
              </p>
            ) : (
              <TimelineChart data={timelineData} />
            )}
          </CardContent>
        </Card>

        {/* Response rate by source */}
        <Card>
          <CardHeader>
            <CardTitle>Response Rate by Source</CardTitle>
            <CardDescription>
              Which job boards get the most responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {responseBySource.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No applications yet.
              </p>
            ) : (
              <ResponseRateChart
                data={responseBySource.map((r) => ({
                  name: getSourceLabel(r.source),
                  total: r.total,
                  responses: r.responses,
                  rate: r.rate,
                }))}
              />
            )}
          </CardContent>
        </Card>

        {/* Response rate by CV */}
        <Card>
          <CardHeader>
            <CardTitle>Response Rate by CV</CardTitle>
            <CardDescription>Which CV version performs best</CardDescription>
          </CardHeader>
          <CardContent>
            {responseByCv.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No applications with CVs yet.
              </p>
            ) : (
              <ResponseRateChart
                data={responseByCv.map((r) => ({
                  name: r.cvName,
                  total: r.total,
                  responses: r.responses,
                  rate: r.rate,
                }))}
              />
            )}
          </CardContent>
        </Card>

        {/* Applications by country */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Country</CardTitle>
            <CardDescription>Geographic distribution of your applications</CardDescription>
          </CardHeader>
          <CardContent>
            {countryData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No applications with country data yet.
              </p>
            ) : (
              <CountryChart data={countryData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest job applications</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/applications">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                No applications yet. Start tracking your job search!
              </p>
              <Button asChild>
                <Link href="/applications/new">Add your first application</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  className="flex items-center justify-between rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <span className="font-medium">
                      {app.role}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {app.company.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(app.appliedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications by Country - Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications by Country (Breakdown)</CardTitle>
          <CardDescription>
            Weekly, monthly, and all-time application counts by country
          </CardDescription>
        </CardHeader>
        <CardContent>
          {countryStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications with country data yet.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-center">This Week</TableHead>
                    <TableHead className="text-center">This Month</TableHead>
                    <TableHead className="text-center">All Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryStats.map((stat) => (
                    <TableRow key={stat.country}>
                      <TableCell className="font-medium">{stat.country}</TableCell>
                      <TableCell className="text-center">{stat.week}</TableCell>
                      <TableCell className="text-center">{stat.month}</TableCell>
                      <TableCell className="text-center font-semibold">{stat.allTime}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-center">
                      {countryStats.reduce((sum, s) => sum + s.week, 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      {countryStats.reduce((sum, s) => sum + s.month, 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      {countryStats.reduce((sum, s) => sum + s.allTime, 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
