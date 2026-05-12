import { CompanyForm } from "@/components/app/company-form";

export default function NewCompanyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Company</h1>
        <p className="text-muted-foreground">
          Add a new company to track applications
        </p>
      </div>

      <div className="max-w-2xl">
        <CompanyForm />
      </div>
    </div>
  );
}
