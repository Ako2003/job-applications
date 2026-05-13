import {
  User,
  BarChart3,
  Download,
  FileText,
  Building2,
  Files,
  Users,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/lib/auth";
import { getAccountStats } from "@/lib/actions/settings";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/validation/application";
import { ProfileForm } from "./profile-form";
import { ExportButton } from "./export-button";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status: string): string {
  return APPLICATION_STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

export default async function SettingsPage() {
  const user = await requireUser();
  const stats = await getAccountStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={{ name: user.name, email: user.email }} />
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Account Statistics
          </CardTitle>
          <CardDescription>
            Overview of your job tracking data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border bg-card p-4 text-center">
              <FileText className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-2xl font-bold">{stats.applications}</p>
              <p className="text-xs text-muted-foreground">Applications</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <Building2 className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-2xl font-bold">{stats.companies}</p>
              <p className="text-xs text-muted-foreground">Companies</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <Files className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-2xl font-bold">{stats.cvTemplates}</p>
              <p className="text-xs text-muted-foreground">CV Templates</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <Users className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-2xl font-bold">{stats.contacts}</p>
              <p className="text-xs text-muted-foreground">Contacts</p>
            </div>
          </div>

          {/* Status breakdown */}
          {stats.statusBreakdown.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="mb-3 text-sm font-medium">Application Status Breakdown</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.statusBreakdown.map((item) => (
                    <div
                      key={item.status}
                      className="rounded-lg border bg-muted/50 px-3 py-1.5 text-sm"
                    >
                      <span className="text-muted-foreground">{getStatusLabel(item.status)}:</span>{" "}
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Account info */}
          <Separator />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Account created on {formatDate(user.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Download all your data as a JSON file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Export includes all your applications, companies, CV templates, contacts, and events.
            The exported file can be used for backup or analysis purposes.
          </p>
          <ExportButton />
        </CardContent>
      </Card>
    </div>
  );
}
