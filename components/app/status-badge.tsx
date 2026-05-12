import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/validation/application";

type StatusBadgeProps = {
  status: string;
};

function getStatusVariant(status: string): "default" | "secondary" | "success" | "warning" | "info" | "destructive" {
  switch (status) {
    case "OFFER":
      return "success";
    case "PHONE_INTERVIEW":
    case "TECHNICAL_INTERVIEW":
    case "ONSITE_FINAL":
      return "info";
    case "SCREENING":
      return "warning";
    case "REJECTED":
    case "WITHDRAWN":
    case "GHOSTED":
      return "destructive";
    case "APPLIED":
    case "DRAFT":
    default:
      return "secondary";
  }
}

function getStatusLabel(status: string): string {
  return APPLICATION_STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={getStatusVariant(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
