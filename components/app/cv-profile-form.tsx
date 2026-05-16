"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateCVProfile,
  type CVBuilderFormState,
} from "@/lib/actions/cv-builder";
import {
  LANGUAGE_LEVELS,
  type ExperienceItem,
  type EducationItem,
  type CertificationItem,
  type AchievementItem,
  type LanguageSkillItem,
  type SkillGroup,
  type ProjectItem,
  type ReferenceItem,
} from "@/lib/validation/cv-builder";
import { toast } from "sonner";

type CVProfileData = {
  fullName: string;
  tagline: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  photoUrl: string | null;
  summary: string | null;
  highlights: unknown;
  technicalSkills: unknown;
  experience: unknown;
  education: unknown;
  certifications: unknown;
  achievements: unknown;
  languageSkills: unknown;
  featuredProjects: unknown;
  references: unknown;
};

type Props = {
  profile: CVProfileData;
};

export function CVProfileForm({ profile }: Props) {
  // Form state for arrays
  const [highlights, setHighlights] = useState<string[]>(
    Array.isArray(profile.highlights) ? profile.highlights as string[] : []
  );
  const [technicalSkills, setTechnicalSkills] = useState<SkillGroup[]>(
    Array.isArray(profile.technicalSkills) ? profile.technicalSkills as SkillGroup[] : []
  );
  const [experience, setExperience] = useState<ExperienceItem[]>(
    Array.isArray(profile.experience) ? profile.experience as ExperienceItem[] : []
  );
  const [education, setEducation] = useState<EducationItem[]>(
    Array.isArray(profile.education) ? profile.education as EducationItem[] : []
  );
  const [certifications, setCertifications] = useState<CertificationItem[]>(
    Array.isArray(profile.certifications) ? profile.certifications as CertificationItem[] : []
  );
  const [achievements, setAchievements] = useState<AchievementItem[]>(
    Array.isArray(profile.achievements) ? profile.achievements as AchievementItem[] : []
  );
  const [languageSkills, setLanguageSkills] = useState<LanguageSkillItem[]>(
    Array.isArray(profile.languageSkills) ? profile.languageSkills as LanguageSkillItem[] : []
  );
  const [featuredProjects, setFeaturedProjects] = useState<ProjectItem[]>(
    Array.isArray(profile.featuredProjects) ? profile.featuredProjects as ProjectItem[] : []
  );
  const [references, setReferences] = useState<ReferenceItem[]>(
    Array.isArray(profile.references) ? profile.references as ReferenceItem[] : []
  );

  const [state, formAction, isPending] = useActionState<CVBuilderFormState, FormData>(
    async (prevState, formData) => {
      const result = await updateCVProfile(prevState, formData);
      if (!result.error) {
        toast.success("Profile saved successfully!");
      }
      return result;
    },
    {}
  );

  const genId = () => Math.random().toString(36).substr(2, 9);

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields for array data */}
      <input type="hidden" name="highlights" value={JSON.stringify(highlights)} />
      <input type="hidden" name="technicalSkills" value={JSON.stringify(technicalSkills)} />
      <input type="hidden" name="experience" value={JSON.stringify(experience)} />
      <input type="hidden" name="education" value={JSON.stringify(education)} />
      <input type="hidden" name="certifications" value={JSON.stringify(certifications)} />
      <input type="hidden" name="achievements" value={JSON.stringify(achievements)} />
      <input type="hidden" name="languageSkills" value={JSON.stringify(languageSkills)} />
      <input type="hidden" name="featuredProjects" value={JSON.stringify(featuredProjects)} />
      <input type="hidden" name="references" value={JSON.stringify(references)} />

      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your contact details displayed at the top of the CV</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={profile.fullName}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={profile.email}
              placeholder="john@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={profile.phone || ""}
              placeholder="+49 123 456789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={profile.location || ""}
              placeholder="Berlin, Germany"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tagline">Tagline / Title</Label>
            <Input
              id="tagline"
              name="tagline"
              defaultValue={profile.tagline || ""}
              placeholder="Experienced Software Engineer: Innovator in Scalable Solutions"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="photoUrl">Photo URL</Label>
            <Input
              id="photoUrl"
              name="photoUrl"
              defaultValue={profile.photoUrl || ""}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="summary"
            defaultValue={profile.summary || ""}
            placeholder="Dynamic and dedicated Software Engineer..."
            rows={5}
          />
        </CardContent>
      </Card>

      {/* Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Highlights</CardTitle>
          <CardDescription>Key highlights shown in the sidebar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {highlights.map((highlight, index) => (
            <div key={index} className="flex gap-2">
              <GripVertical className="h-9 w-5 text-muted-foreground shrink-0" />
              <Input
                value={highlight}
                onChange={(e) => {
                  const newHighlights = [...highlights];
                  newHighlights[index] = e.target.value;
                  setHighlights(newHighlights);
                }}
                placeholder="e.g., High-Traffic Applications"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setHighlights(highlights.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setHighlights([...highlights, ""])}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Highlight
          </Button>
        </CardContent>
      </Card>

      {/* Technical Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Skills</CardTitle>
          <CardDescription>Group your skills (each row is a bullet point)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {technicalSkills.map((group, index) => (
            <div key={group.id || index} className="flex gap-2">
              <GripVertical className="h-9 w-5 text-muted-foreground shrink-0" />
              <Input
                value={group.skills}
                onChange={(e) => {
                  const newSkills = [...technicalSkills];
                  newSkills[index] = { ...group, skills: e.target.value };
                  setTechnicalSkills(newSkills);
                }}
                placeholder="JavaScript, TypeScript, React, Next.js"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setTechnicalSkills(technicalSkills.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTechnicalSkills([...technicalSkills, { id: genId(), skills: "" }])}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill Group
          </Button>
        </CardContent>
      </Card>

      {/* Experience - Master list */}
      <Card>
        <CardHeader>
          <CardTitle>Work Experience</CardTitle>
          <CardDescription>Your master experience list. Create variations to customize bullets for specific jobs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {experience.map((exp, index) => (
            <div key={exp.id || index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-medium">Position {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setExperience(experience.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) => {
                      const newExp = [...experience];
                      newExp[index] = { ...exp, title: e.target.value };
                      setExperience(newExp);
                    }}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => {
                      const newExp = [...experience];
                      newExp[index] = { ...exp, company: e.target.value };
                      setExperience(newExp);
                    }}
                    placeholder="Company Name LLC"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    value={exp.startDate}
                    onChange={(e) => {
                      const newExp = [...experience];
                      newExp[index] = { ...exp, startDate: e.target.value };
                      setExperience(newExp);
                    }}
                    placeholder="MM/YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    value={exp.endDate || ""}
                    onChange={(e) => {
                      const newExp = [...experience];
                      newExp[index] = { ...exp, endDate: e.target.value, current: !e.target.value };
                      setExperience(newExp);
                    }}
                    placeholder="MM/YYYY (empty = current)"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Default Bullet Points</Label>
                {exp.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex gap-2">
                    <Input
                      value={bullet}
                      onChange={(e) => {
                        const newExp = [...experience];
                        const newBullets = [...exp.bullets];
                        newBullets[bulletIndex] = e.target.value;
                        newExp[index] = { ...exp, bullets: newBullets };
                        setExperience(newExp);
                      }}
                      placeholder="Achievement or responsibility..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newExp = [...experience];
                        newExp[index] = { ...exp, bullets: exp.bullets.filter((_, i) => i !== bulletIndex) };
                        setExperience(newExp);
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
                    const newExp = [...experience];
                    newExp[index] = { ...exp, bullets: [...exp.bullets, ""] };
                    setExperience(newExp);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bullet
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setExperience([
                ...experience,
                { id: genId(), title: "", company: "", startDate: "", endDate: "", current: false, bullets: [] },
              ])
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {education.map((edu, index) => (
            <div key={edu.id || index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-medium">Education {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEducation(education.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Degree *</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...education];
                      newEdu[index] = { ...edu, degree: e.target.value };
                      setEducation(newEdu);
                    }}
                    placeholder="Bachelor's in Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Institution *</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => {
                      const newEdu = [...education];
                      newEdu[index] = { ...edu, institution: e.target.value };
                      setEducation(newEdu);
                    }}
                    placeholder="University Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={edu.location || ""}
                    onChange={(e) => {
                      const newEdu = [...education];
                      newEdu[index] = { ...edu, location: e.target.value };
                      setEducation(newEdu);
                    }}
                    placeholder="City, Country"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Start Year</Label>
                    <Input
                      value={edu.startYear}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[index] = { ...edu, startYear: e.target.value };
                        setEducation(newEdu);
                      }}
                      placeholder="2020"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Year</Label>
                    <Input
                      value={edu.endYear || ""}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[index] = { ...edu, endYear: e.target.value };
                        setEducation(newEdu);
                      }}
                      placeholder="2024"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setEducation([
                ...education,
                { id: genId(), degree: "", institution: "", location: "", startYear: "", endYear: "" },
              ])
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Certifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {certifications.map((cert, index) => (
            <div key={cert.id || index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-medium">Certification {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCertifications(certifications.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  value={cert.name}
                  onChange={(e) => {
                    const newCerts = [...certifications];
                    newCerts[index] = { ...cert, name: e.target.value };
                    setCertifications(newCerts);
                  }}
                  placeholder="Certification Name"
                />
                <Input
                  value={cert.issuer || ""}
                  onChange={(e) => {
                    const newCerts = [...certifications];
                    newCerts[index] = { ...cert, issuer: e.target.value };
                    setCertifications(newCerts);
                  }}
                  placeholder="Issuer"
                />
                <Input
                  value={cert.year || ""}
                  onChange={(e) => {
                    const newCerts = [...certifications];
                    newCerts[index] = { ...cert, year: e.target.value };
                    setCertifications(newCerts);
                  }}
                  placeholder="Year"
                />
              </div>
              <Textarea
                value={(cert.topics || []).join("\n")}
                onChange={(e) => {
                  const newCerts = [...certifications];
                  newCerts[index] = { ...cert, topics: e.target.value.split("\n").filter(Boolean) };
                  setCertifications(newCerts);
                }}
                placeholder="Topics (one per line)"
                rows={2}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setCertifications([...certifications, { id: genId(), name: "", issuer: "", year: "", topics: [] }])}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Button>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement, index) => (
            <div key={achievement.id || index} className="flex gap-2">
              <Input
                value={achievement.title}
                onChange={(e) => {
                  const newAch = [...achievements];
                  newAch[index] = { ...achievement, title: e.target.value };
                  setAchievements(newAch);
                }}
                placeholder="1st place in Hackathon"
                className="flex-1"
              />
              <Input
                value={achievement.date || ""}
                onChange={(e) => {
                  const newAch = [...achievements];
                  newAch[index] = { ...achievement, date: e.target.value };
                  setAchievements(newAch);
                }}
                placeholder="12/2023"
                className="w-32"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setAchievements(achievements.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAchievements([...achievements, { id: genId(), title: "", date: "" }])}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </Button>
        </CardContent>
      </Card>

      {/* Language Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Language Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {languageSkills.map((lang, index) => (
            <div key={lang.id || index} className="flex gap-2">
              <Input
                value={lang.language}
                onChange={(e) => {
                  const newLangs = [...languageSkills];
                  newLangs[index] = { ...lang, language: e.target.value };
                  setLanguageSkills(newLangs);
                }}
                placeholder="German"
                className="flex-1"
              />
              <Select
                value={lang.level || ""}
                onValueChange={(value) => {
                  if (!value) return;
                  const newLangs = [...languageSkills];
                  newLangs[index] = { id: lang.id, language: lang.language, level: value };
                  setLanguageSkills(newLangs);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_LEVELS.map((lvl) => (
                    <SelectItem key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setLanguageSkills(languageSkills.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLanguageSkills([...languageSkills, { id: genId(), language: "", level: "" }])}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Language
          </Button>
        </CardContent>
      </Card>

      {/* Featured Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {featuredProjects.map((proj, index) => (
            <div key={proj.id || index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-medium">Project {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFeaturedProjects(featuredProjects.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={proj.name}
                  onChange={(e) => {
                    const newProj = [...featuredProjects];
                    newProj[index] = { ...proj, name: e.target.value };
                    setFeaturedProjects(newProj);
                  }}
                  placeholder="Project Name"
                />
                <Input
                  value={proj.techStack || ""}
                  onChange={(e) => {
                    const newProj = [...featuredProjects];
                    newProj[index] = { ...proj, techStack: e.target.value };
                    setFeaturedProjects(newProj);
                  }}
                  placeholder="React, TypeScript, Next.js"
                />
                <Input
                  value={proj.liveUrl || ""}
                  onChange={(e) => {
                    const newProj = [...featuredProjects];
                    newProj[index] = { ...proj, liveUrl: e.target.value };
                    setFeaturedProjects(newProj);
                  }}
                  placeholder="Live URL"
                />
                <Input
                  value={proj.githubUrl || ""}
                  onChange={(e) => {
                    const newProj = [...featuredProjects];
                    newProj[index] = { ...proj, githubUrl: e.target.value };
                    setFeaturedProjects(newProj);
                  }}
                  placeholder="GitHub URL"
                />
              </div>
              <div className="space-y-2">
                <Label>Bullet Points</Label>
                {proj.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex gap-2">
                    <Input
                      value={bullet}
                      onChange={(e) => {
                        const newProj = [...featuredProjects];
                        const newBullets = [...proj.bullets];
                        newBullets[bulletIndex] = e.target.value;
                        newProj[index] = { ...proj, bullets: newBullets };
                        setFeaturedProjects(newProj);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newProj = [...featuredProjects];
                        newProj[index] = { ...proj, bullets: proj.bullets.filter((_, i) => i !== bulletIndex) };
                        setFeaturedProjects(newProj);
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
                    const newProj = [...featuredProjects];
                    newProj[index] = { ...proj, bullets: [...proj.bullets, ""] };
                    setFeaturedProjects(newProj);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bullet
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setFeaturedProjects([
                ...featuredProjects,
                { id: genId(), name: "", techStack: "", bullets: [], liveUrl: "", githubUrl: "" },
              ])
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <CardTitle>References</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {references.map((ref, index) => (
            <div key={ref.id || index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-medium">Reference {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReferences(references.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={ref.name}
                  onChange={(e) => {
                    const newRefs = [...references];
                    newRefs[index] = { ...ref, name: e.target.value };
                    setReferences(newRefs);
                  }}
                  placeholder="Name"
                />
                <Input
                  value={ref.title || ""}
                  onChange={(e) => {
                    const newRefs = [...references];
                    newRefs[index] = { ...ref, title: e.target.value };
                    setReferences(newRefs);
                  }}
                  placeholder="Title"
                />
                <Input
                  value={ref.company || ""}
                  onChange={(e) => {
                    const newRefs = [...references];
                    newRefs[index] = { ...ref, company: e.target.value };
                    setReferences(newRefs);
                  }}
                  placeholder="Company"
                />
                <Input
                  value={ref.phone || ""}
                  onChange={(e) => {
                    const newRefs = [...references];
                    newRefs[index] = { ...ref, phone: e.target.value };
                    setReferences(newRefs);
                  }}
                  placeholder="Phone"
                />
                <Input
                  value={ref.email || ""}
                  onChange={(e) => {
                    const newRefs = [...references];
                    newRefs[index] = { ...ref, email: e.target.value };
                    setReferences(newRefs);
                  }}
                  placeholder="Email"
                  className="md:col-span-2"
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setReferences([
                ...references,
                { id: genId(), name: "", title: "", company: "", phone: "", email: "" },
              ])
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Reference
          </Button>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
