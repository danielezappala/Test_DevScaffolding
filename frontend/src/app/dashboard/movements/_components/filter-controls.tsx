"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterBar } from "@/components/filter-bar";
import type { MovementType, Wine } from "@/types";

interface MovementFilterControlsProps {
  wines: Wine[];
  search?: string;
  type?: MovementType | "all";
  wineId?: number;
}

export function MovementFilterControls({ wines, search = "", type, wineId }: MovementFilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateQuery = (key: string, value?: string | number) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    params.delete("page");
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  const debouncedSearch = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (value: string) => {
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }
    debouncedSearch.current = setTimeout(() => updateQuery("q", value.trim()), 300);
  };

  return (
    <FilterBar
      searchValue={search}
      searchPlaceholder="Filtra per nota o riferimento..."
      onSearchChange={handleSearch}
      filters={[
        {
          id: "type",
          label: "Tipo",
          type: "select",
          options: [
            { label: "Entrata", value: "in" },
            { label: "Uscita", value: "out" },
            { label: "Aggiustamento", value: "adjust" },
          ],
        },
        {
          id: "wine_id",
          label: "Vino",
          type: "select",
          options: wines.map((wine) => ({ label: `${wine.name} ${wine.vintage}`, value: wine.id })),
          placeholder: "Tutti",
        },
      ]}
      values={{
        type: type && type !== "all" ? type : "",
        wine_id: wineId?.toString() ?? "",
      }}
      onFilterChange={(id, value) => updateQuery(id, value as string)}
      onReset={() => router.push(pathname)}
    />
  );
}
