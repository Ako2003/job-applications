import { notFound } from "next/navigation";
import { getCompany } from "@/lib/actions/company";
import { CompanyForm } from "@/components/app/company-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCompanyPage({ params }: Props) {
  const { id } = await params;
  const company = await getCompany(id);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Company</h1>
        <p className="text-muted-foreground">
          Update information for {company.name}
        </p>
      </div>

      <div className="max-w-2xl">
        <CompanyForm company={company} />
      </div>
    </div>
  );
}
