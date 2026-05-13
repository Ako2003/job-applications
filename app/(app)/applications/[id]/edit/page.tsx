import { notFound } from "next/navigation";
import {
  getApplication,
  getCompaniesForSelect,
  getCvTemplatesForSelect,
} from "@/lib/actions/application";
import { getDocumentsForSelect } from "@/lib/actions/document";
import { ApplicationForm } from "@/components/app/application-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditApplicationPage({ params }: Props) {
  const { id } = await params;

  const [application, companies, cvTemplates, documents] = await Promise.all([
    getApplication(id),
    getCompaniesForSelect(),
    getCvTemplatesForSelect(),
    getDocumentsForSelect(),
  ]);

  if (!application) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Application</h1>
        <p className="text-muted-foreground">
          Update application for {application.role} at {application.company.name}
        </p>
      </div>

      <div className="max-w-3xl">
        <ApplicationForm
          companies={companies}
          cvTemplates={cvTemplates}
          documents={documents}
          application={application}
        />
      </div>
    </div>
  );
}
