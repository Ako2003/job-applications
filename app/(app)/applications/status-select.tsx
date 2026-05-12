"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateApplicationStatus } from "@/lib/actions/application";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/validation/application";
import { toast } from "sonner";

type StatusSelectProps = {
  applicationId: string;
  currentStatus: string;
};

export function StatusSelect({
  applicationId,
  currentStatus,
}: StatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus: string | null) => {
    if (!newStatus || newStatus === currentStatus) return;

    startTransition(async () => {
      const result = await updateApplicationStatus(applicationId, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status updated to ${newStatus.replace(/_/g, " ").toLowerCase()}`);
      }
    });
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger className="h-8 w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {APPLICATION_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
