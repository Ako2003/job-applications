import {
  getCompaniesForSelect,
  getCvTemplatesForSelect,
} from "@/lib/actions/application";
import { getDocumentsForSelect } from "@/lib/actions/document";
import { ApplicationForm } from "@/components/app/application-form";

type Props = {
  searchParams: Promise<{ companyId?: string }>;
};

export default async function NewApplicationPage({ searchParams }: Props) {
  const { companyId } = await searchParams;

  const [companies, cvTemplates, documents] = await Promise.all([
    getCompaniesForSelect(),
    getCvTemplatesForSelect(),
    getDocumentsForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Application</h1>
        <p className="text-muted-foreground">
          Track a new job application
        </p>
      </div>

      <div className="max-w-3xl">
        <ApplicationForm
          companies={companies}
          cvTemplates={cvTemplates}
          documents={documents}
          preselectedCompanyId={companyId}
        />
      </div>
    </div>
  );
}
