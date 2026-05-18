import { PlanForm } from "../plan-form";

export default function NewApplicationPlanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Plan</h1>
        <p className="text-muted-foreground">
          Set your weekly application target for a country
        </p>
      </div>

      <div className="max-w-2xl">
        <PlanForm />
      </div>
    </div>
  );
}
