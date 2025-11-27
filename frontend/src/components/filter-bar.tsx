"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type FilterValue = string | number | boolean | undefined;

export type FilterBarOption = {
  id: string;
  label: string;
  type: "select" | "checkbox";
  options?: { label: string; value: string | number }[];
  placeholder?: string;
};

export interface FilterBarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterBarOption[];
  values?: Record<string, FilterValue>;
  onFilterChange?: (id: string, value: FilterValue) => void;
  actionsSlot?: React.ReactNode;
  onReset?: () => void;
  className?: string;
}

export function FilterBar({
  searchValue = "",
  searchPlaceholder = "Cerca...",
  onSearchChange,
  filters = [],
  values = {},
  onFilterChange,
  actionsSlot,
  onReset,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between", className)}>
      <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center rounded-xl border border-border bg-background px-3 py-2 text-sm focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/40">
          <span className="mr-2 text-muted-foreground">⌘K</span>
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {filters.map((filter) => {
          if (filter.type === "select") {
            return (
              <label key={filter.id} className="flex flex-col text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {filter.label}
                <div className="mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/40">
                  <select
                    className="w-full bg-transparent text-foreground outline-none"
                    value={(values[filter.id] as string | number | undefined) ?? ""}
                    onChange={(event) => onFilterChange?.(filter.id, event.target.value || undefined)}
                  >
                    <option value="">{filter.placeholder ?? "Tutti"}</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            );
          }

          if (filter.type === "checkbox") {
            const checked = Boolean(values[filter.id]);
            return (
              <label
                key={filter.id}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:border-primary/50",
                  checked && "border-primary/60 bg-primary/10 text-primary-foreground"
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
                  checked={checked}
                  onChange={(event) => onFilterChange?.(filter.id, event.target.checked)}
                />
                {filter.label}
              </label>
            );
          }

          return null;
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {actionsSlot}
        {onReset && (
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground underline-offset-4 hover:underline"
            onClick={onReset}
          >
            Reset filtri
          </button>
        )}
      </div>
    </div>
  );
}
