import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CVVariationForm } from "@/components/app/cv-variation-form";
import { getCVVariation, getCVProfile } from "@/lib/actions/cv-builder";
import type { ExperienceItem } from "@/lib/validation/cv-builder";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCVVariationPage({ params }: Props) {
  const { id } = await params;
  const [variation, profile] = await Promise.all([
    getCVVariation(id),
    getCVProfile(),
  ]);

  if (!variation) {
    notFound();
  }

  const masterExperience = (profile.experience as ExperienceItem[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cv-builder">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit CV Variation</h1>
          <p className="text-muted-foreground">{variation.name}</p>
        </div>
      </div>

      <CVVariationForm
        variation={{
          id: variation.id,
          name: variation.name,
          language: variation.language,
          experience: variation.experience,
        }}
        masterExperience={masterExperience}
      />
    </div>
  );
}
