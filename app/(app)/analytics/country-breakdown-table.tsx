"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCountryFlag, getCountryName } from "@/lib/utils/countries";

export type CountryBreakdownRow = {
  country: string;
  total: number;
  active: number;
  interviewed: number;
  offers: number;
  rejected: number;
  ghosted: number;
  interviewRate: number;
  offerRate: number;
};

type SortKey = keyof Omit<CountryBreakdownRow, "country">;

type Column = {
  key: SortKey;
  label: string;
  /** Render as a percentage value. */
  isRate?: boolean;
};

const COLUMNS: Column[] = [
  { key: "total", label: "Total" },
  { key: "active", label: "Active" },
  { key: "interviewed", label: "Interviewed" },
  { key: "offers", label: "Offers" },
  { key: "rejected", label: "Rejected" },
  { key: "ghosted", label: "Ghosted" },
  { key: "interviewRate", label: "Interview %", isRate: true },
  { key: "offerRate", label: "Offer %", isRate: true },
];

type Props = {
  data: CountryBreakdownRow[];
};

export function CountryBreakdownTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDesc, setSortDesc] = useState(true);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const sorted = [...data].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortDesc ? -diff : diff;
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Country</TableHead>
            {COLUMNS.map((col) => (
              <TableHead key={col.key} className="text-right">
                <button
                  type="button"
                  onClick={() => toggleSort(col.key)}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  {col.label}
                  <ArrowUpDown
                    className={`h-3 w-3 ${
                      sortKey === col.key
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                    }`}
                  />
                </button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.country}>
              <TableCell className="font-medium whitespace-nowrap">
                <Link
                  href={`/applications?country=${encodeURIComponent(row.country)}`}
                  className="hover:underline"
                >
                  <span className="mr-1.5">{getCountryFlag(row.country)}</span>
                  {getCountryName(row.country)}
                </Link>
              </TableCell>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.key}
                  className="text-right tabular-nums text-muted-foreground"
                >
                  {col.isRate ? `${row[col.key]}%` : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No country data yet. Add a country to your applications to see this
          breakdown.
        </p>
      )}
    </div>
  );
}
