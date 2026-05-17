"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when searching
      params.delete("page");
      startTransition(() => {
        router.push(`/companies?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    startTransition(() => {
      router.push(`/companies?${params.toString()}`);
    });
  }, [router, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    updateFilter("search", search);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="flex gap-2">
      <div className="relative flex-1 sm:flex-none">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          name="search"
          placeholder="Search companies..."
          defaultValue={currentSearch}
          className="w-full sm:w-[250px] pl-8"
          disabled={isPending}
        />
      </div>
      <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
        Search
      </Button>
      {currentSearch && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSearch}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}
