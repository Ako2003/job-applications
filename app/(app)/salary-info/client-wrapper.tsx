"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { JobPlatformSalaryForm } from "@/components/app/job-platform-salary-form";

type EntryData = {
  id: string;
  country: string;
  platform: string;
  url: string | null;
  salaryMinAnnual: number | null;
  salaryMaxAnnual: number | null;
  currency: string;
  notes: string | null;
};

type Props = {
  children: React.ReactNode;
  entry?: EntryData;
};

export function SalaryInfoClientWrapper({ children, entry }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Entry" : "Add Salary Information"}</DialogTitle>
          <DialogDescription>
            {entry
              ? "Update the salary information for this platform."
              : "Add salary range data from a job platform."}
          </DialogDescription>
        </DialogHeader>
        <JobPlatformSalaryForm entry={entry} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
