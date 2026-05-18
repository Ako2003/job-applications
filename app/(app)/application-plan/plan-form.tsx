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
import { Switch } from "@/components/ui/switch";
import {
  createApplicationPlan,
  updateApplicationPlan,
  type ApplicationPlanFormState,
} from "@/lib/actions/application-plan";
import {
  PLAN_COUNTRY_OPTIONS,
  PLAN_PLATFORM_OPTIONS,
} from "@/lib/validation/application-plan";

type Plan = {
  id: string;
  country: string;
  appsPerWeek: number;
  platform: string;
  startedAt: Date;
  isActive: boolean;
  notes: string | null;
};

type Props = {
  plan?: Plan;
};

function formatDateForInput(date: Date): string {
  return new Date(date).toISOString().split("T")[0];
}

export function PlanForm({ plan }: Props) {
  const isEditing = !!plan;

  const action = isEditing
    ? updateApplicationPlan.bind(null, plan.id)
    : createApplicationPlan;

  const [state, formAction, isPending] = useActionState<
    ApplicationPlanFormState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Select name="country" defaultValue={plan?.country}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {PLAN_COUNTRY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.fieldErrors?.country && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.country[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform">Platform *</Label>
          <Select name="platform" defaultValue={plan?.platform}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {PLAN_PLATFORM_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.fieldErrors?.platform && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.platform[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="appsPerWeek">Applications per Week *</Label>
          <Input
            id="appsPerWeek"
            name="appsPerWeek"
            type="number"
            min={1}
            max={100}
            defaultValue={plan?.appsPerWeek ?? 5}
            required
          />
          {state.fieldErrors?.appsPerWeek && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.appsPerWeek[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startedAt">Started At</Label>
          <Input
            id="startedAt"
            name="startedAt"
            type="date"
            defaultValue={
              plan?.startedAt
                ? formatDateForInput(plan.startedAt)
                : formatDateForInput(new Date())
            }
          />
        </div>

        <div className="flex items-center space-x-2 sm:col-span-2">
          <Switch
            id="isActive"
            name="isActive"
            defaultChecked={plan?.isActive ?? true}
            value="true"
          />
          <Label htmlFor="isActive">Active Plan</Label>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={plan?.notes ?? ""}
            placeholder="Any additional notes about this plan..."
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
              : "Create Plan"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/application-plan">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
