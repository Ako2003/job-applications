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
import {
  createCompany,
  updateCompany,
  type CreateCompanyState,
} from "@/lib/actions/company";
import { SIZE_BAND_OPTIONS } from "@/lib/validation/company";

type Company = {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  sizeBand: string | null;
  hqCity: string | null;
  hqCountry: string | null;
  notes: string | null;
};

type CompanyFormProps = {
  company?: Company;
};

const initialState: CreateCompanyState = {};

export function CompanyForm({ company }: CompanyFormProps) {
  const isEditing = !!company;

  const action = isEditing
    ? updateCompany.bind(null, company.id)
    : createCompany;

  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Company Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={company?.name ?? ""}
            placeholder="Acme Inc."
            required
            disabled={isPending}
          />
          {state.fieldErrors?.name && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={company?.website ?? ""}
            placeholder="https://example.com"
            disabled={isPending}
          />
          {state.fieldErrors?.website && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.website[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            name="industry"
            defaultValue={company?.industry ?? ""}
            placeholder="Technology, Finance, Healthcare..."
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sizeBand">Company Size</Label>
          <Select
            name="sizeBand"
            defaultValue={company?.sizeBand ?? ""}
            disabled={isPending}
          >
            <SelectTrigger id="sizeBand">
              <SelectValue placeholder="Select size..." />
            </SelectTrigger>
            <SelectContent>
              {SIZE_BAND_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hqCity">HQ City</Label>
          <Input
            id="hqCity"
            name="hqCity"
            defaultValue={company?.hqCity ?? ""}
            placeholder="Berlin, New York..."
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hqCountry">HQ Country (ISO code)</Label>
          <Input
            id="hqCountry"
            name="hqCountry"
            defaultValue={company?.hqCountry ?? ""}
            placeholder="DE, US, GB..."
            maxLength={2}
            disabled={isPending}
          />
          {state.fieldErrors?.hqCountry && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.hqCountry[0]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={company?.notes ?? ""}
          placeholder="Any additional information about this company..."
          rows={4}
          disabled={isPending}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Create Company"}
        </Button>
        <Button type="button" variant="outline" asChild disabled={isPending}>
          <Link href={isEditing ? `/companies/${company.id}` : "/companies"}>
            Cancel
          </Link>
        </Button>
      </div>
    </form>
  );
}
