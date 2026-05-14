import Link from "next/link";
import { Suspense } from "react";
import { Plus, FileText, ChevronRight } from "lucide-react";
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
import {
  getApplications,
  getCompaniesForSelect,
  getCvTemplatesForSelect,
} from "@/lib/actions/application";
import {
  SOURCE_OPTIONS,
  REMOTE_POLICY_OPTIONS,
} from "@/lib/validation/application";
import { StatusBadge } from "@/components/app/status-badge";
import { SortableHeader } from "@/components/app/sortable-header";
import { StatusSelect } from "./status-select";
import { Filters } from "./filters";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getSourceLabel(source: string): string {
  return SOURCE_OPTIONS.find((s) => s.value === source)?.label ?? source;
}

function getRemoteLabel(remote: string | null): string {
  if (!remote) return "";
  return REMOTE_POLICY_OPTIONS.find((r) => r.value === remote)?.label ?? remote;
}

type SearchParams = {
  status?: string;
  source?: string;
  companyId?: string;
  cvTemplateId?: string;
  search?: string;
  sort?: string;
  order?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function ApplicationsPage({ searchParams }: Props) {
  const params = await searchParams;

  const [applications, companies, cvTemplates] = await Promise.all([
    getApplications({
      status: params.status,
      source: params.source,
      companyId: params.companyId,
      cvTemplateId: params.cvTemplateId,
      search: params.search,
      sort: params.sort,
      order: params.order,
    }),
    getCompaniesForSelect(),
    getCvTemplatesForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Applications</h1>
          <p className="text-muted-foreground">
            Track your job applications
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/applications/new">
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div className="h-[52px]" />}>
        <Filters companies={companies} cvTemplates={cvTemplates} />
      </Suspense>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          {Object.values(params).some(Boolean) ? (
            <>
              <h3 className="mt-4 text-lg font-medium">No matching applications</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters.
              </p>
            </>
          ) : (
            <>
              <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start tracking your job applications.
              </p>
              <Button asChild className="mt-4">
                <Link href="/applications/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Application
                </Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="block rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{app.role}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {app.company.name}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={app.status} />
                  <Badge variant="outline" className="text-xs">
                    {getSourceLabel(app.source)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(app.appliedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader column="company" label="Company" basePath="/applications" />
                  </TableHead>
                  <TableHead>
                    <SortableHeader column="role" label="Role" basePath="/applications" />
                  </TableHead>
                  <TableHead>
                    <SortableHeader column="status" label="Status" basePath="/applications" />
                  </TableHead>
                  <TableHead>
                    <SortableHeader column="source" label="Source" basePath="/applications" />
                  </TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead>
                    <SortableHeader column="appliedAt" label="Applied" basePath="/applications" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Link
                        href={`/companies/${app.company.id}`}
                        className="font-medium hover:underline"
                      >
                        {app.company.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/applications/${app.id}`}
                        className="font-medium hover:underline"
                      >
                        {app.role}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusSelect
                        applicationId={app.id}
                        currentStatus={app.status}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getSourceLabel(app.source)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.location || "—"}
                      {app.remote && (
                        <span className="ml-1 text-xs">
                          ({getRemoteLabel(app.remote)})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.cvTemplate?.name || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(app.appliedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
