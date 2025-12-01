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
    <div className={cn("flex flex-col gap-4 rounded-lg border border-gray-300 bg-white p-5 shadow-md lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wide text-gray-600">Ricerca</label>
          <div className="flex items-center rounded-lg border-2 border-gray-400 bg-white px-4 py-2.5 text-sm focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/20">
            <span className="mr-2 text-gray-500">⌘K</span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        {filters.map((filter) => {
          if (filter.type === "select") {
            return (
              <label key={filter.id} className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-gray-600">
                {filter.label}
                <div className="rounded-lg border-2 border-gray-400 bg-white px-3 py-2.5 text-sm focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/20">
                  <select
                    className="min-w-[120px] bg-transparent font-semibold text-gray-900 outline-none"
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
                  "inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-gray-400 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-900 shadow-sm transition hover:border-gray-600 hover:bg-gray-50",
                  checked && "border-gray-600 bg-gray-600 text-white hover:bg-gray-500"
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-400 text-gray-600 focus:ring-gray-600/40"
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
            className="rounded-lg border-2 border-gray-400 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-900 shadow-sm transition hover:border-gray-900 hover:bg-gray-50"
            onClick={onReset}
          >
            Reset filtri
          </button>
        )}
      </div>
    </div>
  );
}
