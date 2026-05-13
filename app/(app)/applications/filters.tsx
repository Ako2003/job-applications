"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  APPLICATION_STATUS_OPTIONS,
  SOURCE_OPTIONS,
} from "@/lib/validation/application";

type Company = {
  id: string;
  name: string;
};

type CvTemplate = {
  id: string;
  name: string;
};

type FiltersProps = {
  companies: Company[];
  cvTemplates: CvTemplate[];
};

export function Filters({ companies, cvTemplates }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") || "";
  const currentSource = searchParams.get("source") || "";
  const currentCompany = searchParams.get("companyId") || "";
  const currentCv = searchParams.get("cvTemplateId") || "";
  const currentSearch = searchParams.get("search") || "";

  const hasFilters =
    currentStatus || currentSource || currentCompany || currentCv || currentSearch;

  const companyOptions: ComboboxOption[] = [
    { value: "", label: "All companies" },
    ...companies.map((company) => ({
      value: company.id,
      label: company.name,
    })),
  ];

  const cvOptions: ComboboxOption[] = [
    { value: "", label: "All CVs" },
    ...cvTemplates.map((cv) => ({
      value: cv.id,
      label: cv.name,
    })),
  ];

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`/applications?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push("/applications");
    });
  }, [router]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    updateFilter("search", search);
  };

  return (
    <div className="space-y-3">
      {/* Search - full width on mobile */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search role, company..."
            defaultValue={currentSearch}
            className="w-full sm:w-[200px] pl-8"
            disabled={isPending}
          />
        </div>
        <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
          Search
        </Button>
      </form>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Status filter */}
        <Select
          value={currentStatus}
          onValueChange={(value) => updateFilter("status", value ?? "")}
          disabled={isPending}
        >
          <SelectTrigger className="w-[130px] sm:w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            {APPLICATION_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Source filter */}
        <Select
          value={currentSource}
          onValueChange={(value) => updateFilter("source", value ?? "")}
          disabled={isPending}
        >
          <SelectTrigger className="w-[130px] sm:w-[150px]">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All sources</SelectItem>
            {SOURCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Company filter */}
        {companies.length > 0 && (
          <Combobox
            options={companyOptions}
            value={currentCompany}
            onValueChange={(value) => updateFilter("companyId", value)}
            placeholder="All companies"
            searchPlaceholder="Search companies..."
            emptyText="No companies found."
            disabled={isPending}
            className="w-[150px]"
          />
        )}

        {/* CV filter */}
        {cvTemplates.length > 0 && (
          <Combobox
            options={cvOptions}
            value={currentCv}
            onValueChange={(value) => updateFilter("cvTemplateId", value)}
            placeholder="All CVs"
            searchPlaceholder="Search CVs..."
            emptyText="No CVs found."
            disabled={isPending}
            className="w-[150px]"
          />
        )}

        {/* Clear filters */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filters summary */}
      {hasFilters && (
        <p className="text-sm text-muted-foreground">
          Showing filtered results
          {isPending && " (loading...)"}
        </p>
      )}
    </div>
  );
}
