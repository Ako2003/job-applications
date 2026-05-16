import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CVVariationForm } from "@/components/app/cv-variation-form";
import { getCVProfile } from "@/lib/actions/cv-builder";
import type { ExperienceItem } from "@/lib/validation/cv-builder";

export default async function NewCVVariationPage() {
  const profile = await getCVProfile();

  // Redirect to profile setup if no experience yet
  const experience = (profile.experience as ExperienceItem[]) || [];
  if (experience.length === 0) {
    redirect("/cv-builder/profile");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cv-builder">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create CV Variation</h1>
          <p className="text-muted-foreground">
            Customize your experience for a specific job application
          </p>
        </div>
      </div>

      <CVVariationForm masterExperience={experience} />
    </div>
  );
}
