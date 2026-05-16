import { Plus, DollarSign, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getJobPlatformSalaries } from "@/lib/actions/job-platform-salary";
import { SalaryInfoClientWrapper } from "./client-wrapper";

export default async function SalaryInfoPage() {
  const entries = await getJobPlatformSalaries();

  // Group entries by country
  const groupedByCountry = entries.reduce((acc, entry) => {
    if (!acc[entry.country]) {
      acc[entry.country] = [];
    }
    acc[entry.country].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return "—";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    }
    if (min) return `From ${formatter.format(min)}`;
    if (max) return `Up to ${formatter.format(max)}`;
    return "—";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salary Information</h1>
          <p className="text-muted-foreground">
            Track salary ranges by country and job platform
          </p>
        </div>
        <SalaryInfoClientWrapper>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </SalaryInfoClientWrapper>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No salary data yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start tracking salary information from different countries and platforms.
            </p>
            <SalaryInfoClientWrapper>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add First Entry
              </Button>
            </SalaryInfoClientWrapper>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCountry).map(([country, countryEntries]) => (
            <Card key={country}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {country}
                </CardTitle>
                <CardDescription>
                  {countryEntries.length} platform{countryEntries.length !== 1 ? "s" : ""} tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Salary Range (Annual)</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {countryEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {entry.platform}
                            {entry.url && (
                              <a
                                href={entry.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatSalary(entry.salaryMinAnnual, entry.salaryMaxAnnual, entry.currency)}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[300px] truncate">
                          {entry.notes || "—"}
                        </TableCell>
                        <TableCell>
                          <SalaryInfoClientWrapper entry={entry}>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </SalaryInfoClientWrapper>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
