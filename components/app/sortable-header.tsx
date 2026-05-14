"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SortableHeaderProps = {
  column: string;
  label: string;
  basePath: string;
  className?: string;
};

export function SortableHeader({
  column,
  label,
  basePath,
  className,
}: SortableHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort");
  const currentOrder = searchParams.get("order") || "desc";

  const isActive = currentSort === column;
  const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";

  const handleSort = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", column);
    params.set("order", isActive ? nextOrder : "asc");
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <button
      onClick={handleSort}
      className={cn(
        "flex items-center gap-1 hover:text-foreground transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground",
        className
      )}
    >
      {label}
      {isActive ? (
        currentOrder === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      )}
    </button>
  );
}
