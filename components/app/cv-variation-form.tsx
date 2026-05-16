"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Download, Eye, Copy, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  createCVVariation,
  updateCVVariation,
  deleteCVVariation,
  duplicateCVVariation,
  generatePdfForVariation,
  type CVBuilderFormState,
} from "@/lib/actions/cv-builder";
import {
  CV_LANGUAGE_OPTIONS,
  type ExperienceItem,
  type ExperienceVariation,
} from "@/lib/validation/cv-builder";
import { toast } from "sonner";

type MasterExperience = ExperienceItem[];

type VariationData = {
  id?: string;
  name: string;
  language: string;
  experience: unknown;
};

type Props = {
  variation?: VariationData;
  masterExperience: MasterExperience;
};

export function CVVariationForm({ variation, masterExperience }: Props) {
  const router = useRouter();
  const isEditing = !!variation?.id;

  // Initialize experience overrides from variation or from master
  const [experienceOverrides, setExperienceOverrides] = useState<ExperienceVariation[]>(() => {
    if (variation?.experience && Array.isArray(variation.experience)) {
      return variation.experience as ExperienceVariation[];
    }
    // Initialize with master experience data
    return masterExperience.map((exp) => ({
      masterId: exp.id,
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate,
      bullets: [...exp.bullets],
      hidden: false,
    }));
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const actionFn = isEditing
    ? updateCVVariation.bind(null, variation.id!)
    : createCVVariation;

  const [state, formAction, isPending] = useActionState<CVBuilderFormState, FormData>(
    async (prevState, formData) => {
      const result = await actionFn(prevState, formData);
      if (!result.error && isEditing) {
        toast.success("Variation saved!");
      }
      return result;
    },
    {}
  );

  const handleDelete = async () => {
    if (!variation?.id) return;
    const result = await deleteCVVariation(variation.id);
    if (result.error) {
      toast.error(result.error);
    }
  };

  const handleDuplicate = async () => {
    if (!variation?.id) return;
    const result = await duplicateCVVariation(variation.id);
    if (result.error) {
      toast.error(result.error);
    } else if (result.id) {
      toast.success("Variation duplicated!");
      router.push(`/cv-builder/${result.id}`);
    }
  };

  const handleGeneratePdf = async () => {
    if (!variation?.id) return;
    setIsGenerating(true);

    try {
      const result = await generatePdfForVariation(variation.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.pdf) {
        const blob = new Blob(
          [Uint8Array.from(atob(result.pdf), (c) => c.charCodeAt(0))],
          { type: "application/pdf" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${variation.name || "cv"}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("PDF generated!");
      }
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    if (!variation?.id) return;
    window.open(`/cv-builder/${variation.id}/preview`, "_blank");
  };

  const toggleHidden = (index: number) => {
    const newOverrides = [...experienceOverrides];
    newOverrides[index] = { ...newOverrides[index], hidden: !newOverrides[index].hidden };
    setExperienceOverrides(newOverrides);
  };

  const resetToMaster = (index: number) => {
    const override = experienceOverrides[index];
    const master = masterExperience.find((e) => e.id === override.masterId);
    if (master) {
      const newOverrides = [...experienceOverrides];
      newOverrides[index] = {
        ...override,
        title: master.title,
        company: master.company,
        startDate: master.startDate,
        endDate: master.endDate,
        bullets: [...master.bullets],
        hidden: false,
      };
      setExperienceOverrides(newOverrides);
      toast.success("Reset to master values");
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="experience" value={JSON.stringify(experienceOverrides)} />

      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Variation Info */}
      <Card>
        <CardHeader>
          <CardTitle>Variation Details</CardTitle>
          <CardDescription>Name this variation for the job you&apos;re targeting</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Variation Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={variation?.name || ""}
              placeholder="e.g., Frontend Role - Company X"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">CV Language</Label>
            <Select name="language" defaultValue={variation?.language || "EN"}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {CV_LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Experience Customization */}
      <Card>
        <CardHeader>
          <CardTitle>Customize Experience</CardTitle>
          <CardDescription>
            Modify bullet points for this specific job application. Hidden experiences won&apos;t appear in this CV.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {experienceOverrides.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No work experience in your profile yet.{" "}
              <Link href="/cv-builder/profile" className="text-primary underline">
                Add experience to your profile
              </Link>{" "}
              first.
            </p>
          ) : (
            experienceOverrides.map((exp, index) => (
              <div
                key={exp.masterId}
                className={`border rounded-lg p-4 space-y-4 ${exp.hidden ? "opacity-50 bg-muted/50" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{exp.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {exp.company} | {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleHidden(index)}
                      title={exp.hidden ? "Show in CV" : "Hide from CV"}
                    >
                      {exp.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => resetToMaster(index)}
                      title="Reset to master"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {!exp.hidden && (
                  <div className="space-y-2">
                    <Label>Bullet Points for this Job</Label>
                    {exp.bullets.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex gap-2">
                        <Input
                          value={bullet}
                          onChange={(e) => {
                            const newOverrides = [...experienceOverrides];
                            const newBullets = [...exp.bullets];
                            newBullets[bulletIndex] = e.target.value;
                            newOverrides[index] = { ...exp, bullets: newBullets };
                            setExperienceOverrides(newOverrides);
                          }}
                          placeholder="Tailor this bullet for the job..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newOverrides = [...experienceOverrides];
                            newOverrides[index] = {
                              ...exp,
                              bullets: exp.bullets.filter((_, i) => i !== bulletIndex),
                            };
                            setExperienceOverrides(newOverrides);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOverrides = [...experienceOverrides];
                        newOverrides[index] = { ...exp, bullets: [...exp.bullets, ""] };
                        setExperienceOverrides(newOverrides);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bullet
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Variation"}
        </Button>

        {isEditing && (
          <>
            <Button type="button" variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleGeneratePdf}
              disabled={isGenerating}
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Download PDF"}
            </Button>
            <Button type="button" variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Variation</AlertDialogTitle>
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
          </>
        )}

        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
