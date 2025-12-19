"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Supplier, WineType } from "@/types";
import { FilterBar } from "@/components/filter-bar";
import { wineTypeLabels } from "@/lib/wine-utils";

export interface InventoryFilterControlsProps {
  companies: Supplier[]; // Produttori e Fornitori
  search?: string;
  type?: WineType | "all";
  producerId?: number;
  availableOnly?: boolean;
  belowThreshold?: boolean;
}

export function InventoryFilterControls({
  companies,
  search = "",
  type,
  producerId,
  availableOnly,
  belowThreshold,
}: InventoryFilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filterValues = React.useMemo<Record<string, string | number | boolean | undefined>>(
    () => ({
      type: type && type !== "all" ? type : "",
      producer_id: producerId?.toString() ?? "",
      available_only: availableOnly,
      below_threshold: belowThreshold,
    }),
    [type, producerId, availableOnly, belowThreshold]
  );

  const updateQuery = React.useCallback(
    (key: string, value?: string | number | boolean) => {
      const params = new URLSearchParams(searchParams?.toString());
      const shouldRemove =
        value === undefined || value === "" || (typeof value === "boolean" && value === false);
      if (shouldRemove) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      params.delete("page");
      const nextQuery = params.toString();
      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const handleReset = React.useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString());
    ["q", "type", "producer_id", "available_only", "below_threshold"].forEach((key) => params.delete(key));
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }, [pathname, router, searchParams]);

  const debouncedSearch = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }
    debouncedSearch.current = setTimeout(() => {
      updateQuery("q", value.trim());
    }, 350);
  };

  return (
    <FilterBar
      searchValue={search}
      searchPlaceholder="Cerca vino, annata, denominazione..."
      onSearchChange={handleSearchChange}
      filters={[
        {
          id: "type",
          label: "Tipologia",
          type: "select",
          options: (Object.keys(wineTypeLabels) as WineType[]).map((key) => ({
            label: wineTypeLabels[key],
            value: key,
          })),
          placeholder: "Tutte",
        },
        {
          id: "producer_id",
          label: "Produttore",
          type: "select",
          options: companies.map((company) => ({
            label: company.name,
            value: company.id,
          })),
          placeholder: "Tutti",
        },
        {
          id: "available_only",
          label: "Disponibili",
          type: "checkbox",
        },
        {
          id: "below_threshold",
          label: "Sotto soglia",
          type: "checkbox",
        },
      ]}
      values={filterValues}
      onFilterChange={(id, value) => updateQuery(id, value)}
      onReset={handleReset}
    />
  );
}
