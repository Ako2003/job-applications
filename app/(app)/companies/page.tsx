import Link from "next/link";
import { Plus, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getCompanies } from "@/lib/actions/company";
import { SortableHeader } from "@/components/app/sortable-header";
import { Pagination } from "@/components/app/pagination";
import { SearchBar } from "./search-bar";

type SearchParams = {
  sort?: string;
  order?: string;
  page?: string;
  perPage?: string;
  search?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function CompaniesPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const perPage = params.perPage === "all" ? "all" : (params.perPage ? parseInt(params.perPage, 10) : 10);

  const { companies, total, totalPages, perPage: currentPerPage } = await getCompanies({
    sort: params.sort,
    order: params.order,
    page: currentPage,
    perPage,
    search: params.search,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Companies{" "}
            <span className="text-muted-foreground font-normal text-2xl">
              ({total})
            </span>
          </h1>
          <p className="text-muted-foreground">
            Manage companies you&apos;ve applied to
          </p>
        </div>
        <Button asChild>
          <Link href="/companies/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Link>
        </Button>
      </div>

      <SearchBar />

      {companies.length === 0 && total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Building2 className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No companies yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first company to start tracking applications.
          </p>
          <Button asChild className="mt-4">
            <Link href="/companies/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader column="name" label="Name" basePath="/companies" />
                  </TableHead>
                  <TableHead>
                    <SortableHeader column="industry" label="Industry" basePath="/companies" />
                  </TableHead>
                  <TableHead>
                    <SortableHeader column="location" label="Location" basePath="/companies" />
                  </TableHead>
                  <TableHead>
                    <SortableHeader column="size" label="Size" basePath="/companies" />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortableHeader column="applications" label="Applications" basePath="/companies" className="justify-end" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <Link
                        href={`/companies/${company.id}`}
                        className="font-medium hover:underline"
                      >
                        {company.name}
                      </Link>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {company.industry || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {company.hqCity && company.hqCountry
                        ? `${company.hqCity}, ${company.hqCountry}`
                        : company.hqCity || company.hqCountry || "—"}
                    </TableCell>
                    <TableCell>
                      {company.sizeBand ? (
                        <Badge variant="secondary">{company.sizeBand}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {company._count.applications}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            basePath="/companies"
            perPage={currentPerPage}
          />
        </>
      )}
    </div>
  );
}
