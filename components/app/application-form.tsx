"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  createApplication,
  updateApplication,
  type ApplicationFormState,
} from "@/lib/actions/application";
import {
  APPLICATION_STATUS_OPTIONS,
  SOURCE_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  REMOTE_POLICY_OPTIONS,
  CURRENCY_OPTIONS,
} from "@/lib/validation/application";
import { LANGUAGE_OPTIONS } from "@/lib/validation/cv-template";

type Company = {
  id: string;
  name: string;
};

type CvTemplate = {
  id: string;
  name: string;
  language: string;
};

type Application = {
  id: string;
  role: string;
  jobUrl: string | null;
  source: string;
  sourceListingId: string | null;
  location: string | null;
  country: string | null;
  remote: string | null;
  employment: string | null;
  language: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  coverLetter: string | null;
  status: string;
  appliedAt: Date;
  nextActionAt: Date | null;
  jobDescription: string | null;
  notes: string | null;
  company: { id: string };
  cvTemplate: { id: string } | null;
};

type ApplicationFormProps = {
  companies: Company[];
  cvTemplates: CvTemplate[];
  application?: Application;
  preselectedCompanyId?: string;
};

const initialState: ApplicationFormState = {};

export function ApplicationForm({
  companies,
  cvTemplates,
  application,
  preselectedCompanyId,
}: ApplicationFormProps) {
  const isEditing = !!application;

  const action = isEditing
    ? updateApplication.bind(null, application.id)
    : createApplication;

  const [state, formAction, isPending] = useActionState(action, initialState);

  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const defaultCompanyId =
    application?.company.id || preselectedCompanyId || "";

  const companyOptions: ComboboxOption[] = companies.map((company) => ({
    value: company.id,
    label: company.name,
  }));

  const cvTemplateOptions: ComboboxOption[] = cvTemplates.map((cv) => ({
    value: cv.id,
    label: cv.name,
    description: cv.language,
  }));

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Company & Role */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyId">
              Company <span className="text-destructive">*</span>
            </Label>
            <Combobox
              name="companyId"
              options={companyOptions}
              defaultValue={defaultCompanyId}
              placeholder="Select company..."
              searchPlaceholder="Search companies..."
              emptyText="No companies found."
              disabled={isPending}
            />
            {state.fieldErrors?.companyId && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.companyId[0]}
              </p>
            )}
            <Link
              href="/companies/new"
              className="text-sm text-muted-foreground hover:underline"
            >
              + Add new company
            </Link>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role"
              name="role"
              defaultValue={application?.role ?? ""}
              placeholder="Senior Frontend Developer"
              required
              disabled={isPending}
            />
            {state.fieldErrors?.role && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.role[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">
              Source <span className="text-destructive">*</span>
            </Label>
            <Select
              name="source"
              defaultValue={application?.source ?? "LINKEDIN"}
              disabled={isPending}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source..." />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobUrl">Job URL</Label>
            <Input
              id="jobUrl"
              name="jobUrl"
              type="url"
              defaultValue={application?.jobUrl ?? ""}
              placeholder="https://..."
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Location & Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Location & Type</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={application?.location ?? ""}
              placeholder="Berlin, Germany"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country (ISO)</Label>
            <Input
              id="country"
              name="country"
              defaultValue={application?.country ?? ""}
              placeholder="DE"
              maxLength={2}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remote">Remote Policy</Label>
            <Select
              name="remote"
              defaultValue={application?.remote ?? ""}
              disabled={isPending}
            >
              <SelectTrigger id="remote">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {REMOTE_POLICY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employment">Employment Type</Label>
            <Select
              name="employment"
              defaultValue={application?.employment ?? ""}
              disabled={isPending}
            >
              <SelectTrigger id="employment">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Salary */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Compensation</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="salaryMin">Salary Min (annual, in cents)</Label>
            <Input
              id="salaryMin"
              name="salaryMin"
              type="number"
              defaultValue={application?.salaryMin ?? ""}
              placeholder="5000000"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Enter in minor units (e.g., 5000000 = €50,000)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryMax">Salary Max (annual, in cents)</Label>
            <Input
              id="salaryMax"
              name="salaryMax"
              type="number"
              defaultValue={application?.salaryMax ?? ""}
              placeholder="7000000"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              name="currency"
              defaultValue={application?.currency ?? "EUR"}
              disabled={isPending}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* CV & Application Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Application Details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cvTemplateId">CV Template</Label>
            <Combobox
              name="cvTemplateId"
              options={cvTemplateOptions}
              defaultValue={application?.cvTemplate?.id ?? ""}
              placeholder="Select CV..."
              searchPlaceholder="Search CVs..."
              emptyText="No CVs found."
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Job Language</Label>
            <Select
              name="language"
              defaultValue={application?.language ?? "EN"}
              disabled={isPending}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              name="status"
              defaultValue={application?.status ?? "APPLIED"}
              disabled={isPending}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appliedAt">Applied Date</Label>
            <Input
              id="appliedAt"
              name="appliedAt"
              type="date"
              defaultValue={
                formatDateForInput(application?.appliedAt) ||
                new Date().toISOString().split("T")[0]
              }
              required
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverLetter">Cover Letter Notes</Label>
          <Textarea
            id="coverLetter"
            name="coverLetter"
            defaultValue={application?.coverLetter ?? ""}
            placeholder="Key points from your cover letter..."
            rows={3}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notes</h3>
        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            name="jobDescription"
            defaultValue={application?.jobDescription ?? ""}
            placeholder="Paste or summarize the job description..."
            rows={4}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Personal Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={application?.notes ?? ""}
            placeholder="Your notes about this application..."
            rows={3}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Create Application"}
        </Button>
        <Button type="button" variant="outline" asChild disabled={isPending}>
          <Link
            href={isEditing ? `/applications/${application.id}` : "/applications"}
          >
            Cancel
          </Link>
        </Button>
      </div>
    </form>
  );
}
