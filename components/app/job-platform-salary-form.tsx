"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  createJobPlatformSalary,
  updateJobPlatformSalary,
  deleteJobPlatformSalary,
  type FormState,
} from "@/lib/actions/job-platform-salary";
import {
  COUNTRY_OPTIONS,
  PLATFORM_OPTIONS,
  CURRENCY_OPTIONS,
} from "@/lib/validation/job-platform-salary";
import { toast } from "sonner";

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
  entry?: EntryData;
  onSuccess?: () => void;
};

export function JobPlatformSalaryForm({ entry, onSuccess }: Props) {
  const isEditing = !!entry?.id;

  const actionFn = isEditing
    ? updateJobPlatformSalary.bind(null, entry.id)
    : createJobPlatformSalary;

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (prevState, formData) => {
      const result = await actionFn(prevState, formData);
      if (!result.error) {
        toast.success(isEditing ? "Entry updated!" : "Entry added!");
        onSuccess?.();
      }
      return result;
    },
    {}
  );

  const handleDelete = async () => {
    if (!entry?.id) return;
    const result = await deleteJobPlatformSalary(entry.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Entry deleted!");
      onSuccess?.();
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Select name="country" defaultValue={entry?.country || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform">Platform *</Label>
          <Select name="platform" defaultValue={entry?.platform || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORM_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          defaultValue={entry?.url || ""}
          placeholder="https://linkedin.com/jobs/..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="salaryMinAnnual">Min Salary (Annual)</Label>
          <Input
            id="salaryMinAnnual"
            name="salaryMinAnnual"
            type="number"
            defaultValue={entry?.salaryMinAnnual || ""}
            placeholder="50000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryMaxAnnual">Max Salary (Annual)</Label>
          <Input
            id="salaryMaxAnnual"
            name="salaryMaxAnnual"
            type="number"
            defaultValue={entry?.salaryMaxAnnual || ""}
            placeholder="80000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select name="currency" defaultValue={entry?.currency || "EUR"}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={entry?.notes || ""}
          placeholder="Any additional notes about this salary info..."
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Update" : "Add Entry"}
        </Button>

        {isEditing && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </form>
  );
}
