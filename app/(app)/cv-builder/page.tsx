import Link from "next/link";
import { Plus, FileText, Calendar, User, AlertCircle } from "lucide-react";
import { getCVProfile, getCVVariations } from "@/lib/actions/cv-builder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CVBuilderPage() {
  const profile = await getCVProfile();
  const variations = await getCVVariations();

  const hasExperience = Array.isArray(profile.experience) && profile.experience.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CV Builder</h1>
          <p className="text-muted-foreground">
            Manage your CV profile and create variations for different jobs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/cv-builder/profile">
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
          {hasExperience && (
            <Button asChild>
              <Link href="/cv-builder/new">
                <Plus className="mr-2 h-4 w-4" />
                New Variation
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Profile Status */}
      {!hasExperience && (
        <Card className="border-orange-500/50 bg-orange-500/10">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-semibold">Set up your profile first</h3>
              <p className="text-sm text-muted-foreground">
                Add your work experience to your profile before creating CV variations.
              </p>
            </div>
            <Button asChild className="ml-auto">
              <Link href="/cv-builder/profile">Set Up Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Variations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          CV Variations {variations.length > 0 && `(${variations.length})`}
        </h2>

        {variations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No CV variations yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                {hasExperience
                  ? "Create your first variation to tailor your CV for specific jobs."
                  : "Set up your profile with work experience first, then create variations."}
              </p>
              {hasExperience && (
                <Button asChild>
                  <Link href="/cv-builder/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Variation
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {variations.map((variation) => (
              <Link key={variation.id} href={`/cv-builder/${variation.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {variation.name}
                    </CardTitle>
                    <CardDescription>Language: {variation.language}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Updated {new Date(variation.updatedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
