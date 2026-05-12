import { Plus, Files, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCvTemplates } from "@/lib/actions/cv-template";
import { getCvDownloadUrl } from "@/lib/storage";
import { LANGUAGE_OPTIONS } from "@/lib/validation/cv-template";
import { UploadCvDialog } from "./upload-dialog";
import { CvActions } from "./cv-actions";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getLanguageLabel(code: string): string {
  return LANGUAGE_OPTIONS.find((opt) => opt.value === code)?.label ?? code;
}

export default async function CVsPage() {
  const cvTemplates = await getCvTemplates();

  const activeCvs = cvTemplates.filter((cv) => !cv.isArchived);
  const archivedCvs = cvTemplates.filter((cv) => cv.isArchived);

  // Get signed URLs for all CVs
  const cvUrls = new Map<string, string>();
  await Promise.all(
    cvTemplates.map(async (cv) => {
      const url = await getCvDownloadUrl(cv.storageKey);
      cvUrls.set(cv.id, url);
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">CV Templates</h1>
          <p className="text-muted-foreground">
            Manage your CV versions for applications
          </p>
        </div>
        <UploadCvDialog>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Upload CV
          </Button>
        </UploadCvDialog>
      </div>

      {cvTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Files className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No CV templates yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your first CV to start tracking which version works best.
          </p>
          <UploadCvDialog>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Upload CV
            </Button>
          </UploadCvDialog>
        </div>
      ) : (
        <>
          {activeCvs.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeCvs.map((cv) => {
                const previewUrl = cvUrls.get(cv.id);
                return (
                  <Card key={cv.id} className="overflow-hidden">
                    {/* PDF Preview */}
                    <div className="relative aspect-[8.5/11] w-full bg-muted">
                      {previewUrl ? (
                        <iframe
                          src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="absolute inset-0 h-full w-full"
                          title={`Preview of ${cv.name}`}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <FileText className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="truncate text-base">{cv.name}</CardTitle>
                          {cv.description && (
                            <CardDescription className="line-clamp-1">
                              {cv.description}
                            </CardDescription>
                          )}
                        </div>
                        <CvActions cv={cv} />
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge variant="secondary">
                          {getLanguageLabel(cv.language)}
                        </Badge>
                        <Badge variant="outline">v{cv.version}</Badge>
                        <span className="text-muted-foreground">
                          {cv._count.applications} app{cv._count.applications !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(cv.fileSize)}</span>
                        <span>{formatDate(cv.updatedAt)}</span>
                      </div>
                      {previewUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                          asChild
                        >
                          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {archivedCvs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-muted-foreground">
                Archived ({archivedCvs.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {archivedCvs.map((cv) => {
                  const previewUrl = cvUrls.get(cv.id);
                  return (
                    <Card key={cv.id} className="overflow-hidden opacity-60">
                      {/* PDF Preview */}
                      <div className="relative aspect-[8.5/11] w-full bg-muted">
                        {previewUrl ? (
                          <iframe
                            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="absolute inset-0 h-full w-full"
                            title={`Preview of ${cv.name}`}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <FileText className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="truncate text-base">{cv.name}</CardTitle>
                            {cv.description && (
                              <CardDescription className="line-clamp-1">
                                {cv.description}
                              </CardDescription>
                            )}
                          </div>
                          <CvActions cv={cv} />
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant="secondary">
                            {getLanguageLabel(cv.language)}
                          </Badge>
                          <Badge variant="outline">v{cv.version}</Badge>
                          <span className="text-muted-foreground">
                            {cv._count.applications} app{cv._count.applications !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatFileSize(cv.fileSize)}</span>
                          <span>{formatDate(cv.updatedAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
