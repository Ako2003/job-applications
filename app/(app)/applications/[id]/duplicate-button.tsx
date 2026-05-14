"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { duplicateApplication } from "@/lib/actions/application";
import { toast } from "sonner";

type DuplicateButtonProps = {
  applicationId: string;
};

export function DuplicateButton({ applicationId }: DuplicateButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicateApplication(applicationId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.id) {
        toast.success("Application duplicated");
        router.push(`/applications/${result.id}/edit`);
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDuplicate}
      disabled={isPending}
    >
      <Copy className="mr-2 h-4 w-4" />
      {isPending ? "Duplicating..." : "Duplicate"}
    </Button>
  );
}
