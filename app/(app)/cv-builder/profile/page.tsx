import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CVProfileForm } from "@/components/app/cv-profile-form";
import { getCVProfile } from "@/lib/actions/cv-builder";

export default async function CVProfilePage() {
  const profile = await getCVProfile();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cv-builder">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit CV Profile</h1>
          <p className="text-muted-foreground">
            Update your master CV profile. Changes apply to all variations.
          </p>
        </div>
      </div>

      <CVProfileForm profile={profile} />
    </div>
  );
}
