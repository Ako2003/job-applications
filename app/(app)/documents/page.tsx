import { Plus, FileStack, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDocuments } from "@/lib/actions/document";
import { getDocumentDownloadUrl } from "@/lib/storage";
import {
  DOCUMENT_TYPE_OPTIONS,
  getDocumentTypeLabel,
} from "@/lib/validation/document";
import { UploadDocumentDialog } from "./upload-dialog";
import { DocumentActions } from "./document-actions";

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

export default async function DocumentsPage() {
  const documents = await getDocuments();

  // Group documents by type
  const groupedDocuments = DOCUMENT_TYPE_OPTIONS.map((typeOption) => ({
    type: typeOption.value,
    label: typeOption.label,
    documents: documents.filter((doc) => doc.type === typeOption.value),
  })).filter((group) => group.documents.length > 0);

  // Get signed URLs for all documents
  const docUrls = new Map<string, string>();
  await Promise.all(
    documents.map(async (doc) => {
      const url = await getDocumentDownloadUrl(doc.storageKey);
      docUrls.set(doc.id, url);
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Documents
          </h1>
          <p className="text-muted-foreground">
            Manage cover letters, recommendations, portfolios, and certificates
          </p>
        </div>
        <UploadDocumentDialog>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </UploadDocumentDialog>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <FileStack className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No documents yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your first document to link it to job applications.
          </p>
          <UploadDocumentDialog>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </UploadDocumentDialog>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedDocuments.map((group) => (
            <div key={group.type} className="space-y-4">
              <h2 className="text-lg font-medium">{group.label}s</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.documents.map((doc) => {
                  const previewUrl = docUrls.get(doc.id);
                  return (
                    <Card key={doc.id} className="overflow-hidden">
                      {/* PDF Preview */}
                      <div className="relative aspect-[8.5/11] w-full bg-muted">
                        {previewUrl ? (
                          <iframe
                            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="absolute inset-0 h-full w-full"
                            title={`Preview of ${doc.name}`}
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
                            <CardTitle className="truncate text-base">
                              {doc.name}
                            </CardTitle>
                            {doc.description && (
                              <CardDescription className="line-clamp-1">
                                {doc.description}
                              </CardDescription>
                            )}
                          </div>
                          <DocumentActions document={doc} />
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant="secondary">
                            {getDocumentTypeLabel(doc.type)}
                          </Badge>
                          <span className="text-muted-foreground">
                            {doc._count.applications} app
                            {doc._count.applications !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>{formatDate(doc.updatedAt)}</span>
                        </div>
                        {previewUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full"
                            asChild
                          >
                            <a
                              href={previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
