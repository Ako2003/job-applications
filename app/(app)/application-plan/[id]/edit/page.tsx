import { notFound } from "next/navigation";
import { getApplicationPlan } from "@/lib/actions/application-plan";
import { PlanForm } from "../../plan-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditApplicationPlanPage({ params }: Props) {
  const { id } = await params;
  const plan = await getApplicationPlan(id);

  if (!plan) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Plan</h1>
        <p className="text-muted-foreground">
          Update your application plan for {plan.country}
        </p>
      </div>

      <div className="max-w-2xl">
        <PlanForm plan={plan} />
      </div>
    </div>
  );
}
