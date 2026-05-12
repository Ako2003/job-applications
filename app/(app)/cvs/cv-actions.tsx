"use client";

import { useState, useTransition } from "react";
import {
  MoreHorizontal,
  Download,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { archiveCvTemplate, deleteCvTemplate } from "@/lib/actions/cv-template";
import { toast } from "sonner";

type CvTemplate = {
  id: string;
  name: string;
  isArchived: boolean;
  _count: {
    applications: number;
  };
};

type CvActionsProps = {
  cv: CvTemplate;
};

export function CvActions({ cv }: CvActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDownload = () => {
    window.open(`/api/cv/${cv.id}/download`, "_blank");
  };

  const handleArchive = () => {
    startTransition(async () => {
      const result = await archiveCvTemplate(cv.id, !cv.isArchived);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(cv.isArchived ? "CV restored" : "CV archived");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCvTemplate(cv.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("CV deleted");
      }
      setDeleteDialogOpen(false);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleArchive}>
            {cv.isArchived ? (
              <>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Restore
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete CV Template</DialogTitle>
            <DialogDescription>
              {cv._count.applications > 0
                ? `This CV is used by ${cv._count.applications} application(s). You must archive it instead of deleting.`
                : "Are you sure you want to delete this CV template? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || cv._count.applications > 0}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
