import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  Pencil,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  FileStack,
  DollarSign,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getApplication } from "@/lib/actions/application";
import { getCvDownloadUrl, getDocumentDownloadUrl } from "@/lib/storage";
import { getDocumentTypeLabel } from "@/lib/validation/document";
import {
  SOURCE_OPTIONS,
  REMOTE_POLICY_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  EVENT_TYPE_OPTIONS,
} from "@/lib/validation/application";
import { LANGUAGE_OPTIONS } from "@/lib/validation/cv-template";
import { StatusSelect } from "../status-select";
import { DeleteApplicationButton } from "./delete-button";
import { AddEventDialog } from "./add-event-dialog";

type Props = {
  params: Promise<{ id: string }>;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatSalary(min: number | null, max: number | null, currency: string | null): string {
  if (!min && !max) return "Not specified";
  const curr = currency || "EUR";
  const format = (val: number) => {
    // Convert from cents to full units
    const amount = val / 100;
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  if (min && max) return `${format(min)} - ${format(max)}`;
  if (min) return `From ${format(min)}`;
  if (max) return `Up to ${format(max)}`;
  return "Not specified";
}

function getLabel(options: readonly { value: string; label: string }[], value: string | null): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  // Get CV preview URL if CV exists
  let cvPreviewUrl: string | null = null;
  if (application.cvTemplate?.storageKey) {
    cvPreviewUrl = await getCvDownloadUrl(application.cvTemplate.storageKey);
  }

  // Get document URLs
  const documentUrls = new Map<string, string>();
  if (application.documents.length > 0) {
    await Promise.all(
      application.documents.map(async (doc) => {
        const url = await getDocumentDownloadUrl(doc.storageKey);
        documentUrls.set(doc.id, url);
      })
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {application.role}
            </h1>
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            )}
          </div>
          <p className="text-lg text-muted-foreground">
            <Link
              href={`/companies/${application.company.id}`}
              className="hover:underline"
            >
              {application.company.name}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusSelect
            applicationId={application.id}
            currentStatus={application.status}
          />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/applications/${application.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteApplicationButton applicationId={application.id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick info cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Applied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{formatDate(application.appliedAt)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {getLabel(SOURCE_OPTIONS, application.source)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {application.location || "Not specified"}
                </p>
                {application.remote && (
                  <p className="text-sm text-muted-foreground">
                    {getLabel(REMOTE_POLICY_OPTIONS, application.remote)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Salary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {formatSalary(
                    application.salaryMin,
                    application.salaryMax,
                    application.currency
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Employment Type</p>
                  <p className="font-medium">
                    {getLabel(EMPLOYMENT_TYPE_OPTIONS, application.employment)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-medium">
                    {getLabel(LANGUAGE_OPTIONS, application.language)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CV Used</p>
                  <p className="font-medium">
                    {application.cvTemplate?.name || "None"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{application.country || "—"}</p>
                </div>
              </div>

              {application.jobDescription && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 text-sm font-medium">Job Description</p>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {application.jobDescription}
                    </p>
                  </div>
                </>
              )}

              {application.coverLetter && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 text-sm font-medium">Cover Letter Notes</p>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {application.coverLetter}
                    </p>
                  </div>
                </>
              )}

              {application.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 text-sm font-medium">Notes</p>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {application.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* CV Preview */}
          {cvPreviewUrl && application.cvTemplate && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">CV Used</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={cvPreviewUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <CardDescription>{application.cvTemplate.name}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-[8.5/11] w-full overflow-hidden rounded-b-lg border-t bg-muted">
                  <iframe
                    src={`${cvPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="absolute inset-0 h-full w-full"
                    title="CV Preview"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Linked Documents */}
          {application.documents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileStack className="h-4 w-4" />
                  Linked Documents
                </CardTitle>
                <CardDescription>
                  {application.documents.length} document(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.documents.map((doc) => {
                    const docUrl = documentUrls.get(doc.id);
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {doc.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getDocumentTypeLabel(doc.type)}
                          </p>
                        </div>
                        {docUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Timeline
                </CardTitle>
                <AddEventDialog applicationId={application.id} />
              </div>
              <CardDescription>
                {application.events.length} event(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {application.events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events yet.</p>
              ) : (
                <div className="space-y-4">
                  {application.events.map((event, index) => (
                    <div key={event.id} className="relative pl-6">
                      {index < application.events.length - 1 && (
                        <div className="absolute left-[9px] top-6 h-full w-px bg-border" />
                      )}
                      <div className="absolute left-0 top-1 h-[18px] w-[18px] rounded-full border-2 border-primary bg-background" />
                      <div>
                        <p className="font-medium">
                          {getLabel(EVENT_TYPE_OPTIONS, event.type)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(event.occurredAt)}
                        </p>
                        {event.notes && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contacts */}
          {application.contacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {application.contacts.map((contact) => (
                    <div key={contact.id}>
                      <p className="font-medium">{contact.name}</p>
                      {contact.role && (
                        <p className="text-sm text-muted-foreground">
                          {contact.role}
                        </p>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          {contact.email}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
