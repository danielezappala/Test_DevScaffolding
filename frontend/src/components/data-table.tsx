"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId?: (row: T, index: number) => string | number;
  selectable?: boolean;
  selectedIds?: Array<string | number>;
  onSelectionChange?: (ids: Array<string | number>) => void;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  sortState?: {
    columnId?: string;
    direction?: SortDirection;
  };
  onSortChange?: (columnId: string, direction: SortDirection) => void;
  pagination?: DataTablePagination;
  className?: string;
}

function nextDirection(current?: SortDirection): SortDirection {
  return current === "asc" ? "desc" : "asc";
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  selectable,
  selectedIds,
  onSelectionChange,
  emptyState,
  isLoading,
  sortState,
  onSortChange,
  pagination,
  className,
}: DataTableProps<T>) {
  const rowIds = React.useMemo(
    () => data.map((row, index) => (getRowId ? getRowId(row, index) : index)),
    [data, getRowId]
  );

  const selectedSet = React.useMemo(() => new Set(selectedIds ?? []), [selectedIds]);
  const allSelected = selectable && rowIds.length > 0 && rowIds.every((id) => selectedSet.has(id));

  const handleToggleAll = () => {
    if (!selectable || !onSelectionChange) return;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(rowIds);
    }
  };

  const handleToggleRow = (rowId: string | number) => {
    if (!selectable || !onSelectionChange) return;
    const next = new Set(selectedSet);
    if (next.has(rowId)) {
      next.delete(rowId);
    } else {
      next.add(rowId);
    }
    onSelectionChange(Array.from(next));
  };

  const showEmptyState = !isLoading && data.length === 0;

  return (
    <div className={cn("overflow-hidden rounded-lg border border-gray-300 bg-white shadow-md", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-900">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              {selectable && (
                <th scope="col" className="w-12 px-4 py-3">
                  <input
                    aria-label="Seleziona tutte le righe"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-400 text-gray-900"
                    checked={allSelected}
                    onChange={handleToggleAll}
                  />
                </th>
              )}
              {columns.map((column) => {
                const isSorted = sortState?.columnId === column.id;
                const direction = isSorted ? sortState?.direction : undefined;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-700",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                      column.className,
                      column.sortable && "cursor-pointer select-none"
                    )}
                    onClick={() => {
                      if (!column.sortable || !onSortChange) return;
                      onSortChange(column.id, isSorted ? nextDirection(direction) : "asc");
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {column.header}
                      {column.sortable && (
                        <span className="text-[10px] text-gray-600">
                          {isSorted ? (direction === "asc" ? "↑" : "↓") : "↕"}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 bg-white">
            {isLoading && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-6 text-center text-sm text-gray-600">
                  Caricamento dati...
                </td>
              </tr>
            )}

            {!isLoading &&
              data.map((row, index) => {
                const rowId = rowIds[index];
                const rowSelected = selectedSet.has(rowId);
                return (
                  <tr key={rowId} className="transition hover:bg-gray-100">
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          aria-label="Seleziona riga"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-400 text-gray-900"
                          checked={rowSelected}
                          onChange={() => handleToggleRow(rowId)}
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const cellContent =
                        column.render?.(row) ??
                        (column.accessor ? ((row as Record<string, unknown>)[column.accessor as string] as React.ReactNode) : null);
                      return (
                        <td
                          key={`${column.id}-${rowId}`}
                          className={cn(
                            "whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900",
                            column.align === "right" && "text-right",
                            column.align === "center" && "text-center",
                            column.className
                          )}
                        >
                          {cellContent ?? "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

            {showEmptyState && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-6 text-center text-sm text-gray-600">
                  {emptyState ?? "Nessun risultato trovato."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between border-t border-gray-300 bg-gray-100 px-4 py-3 text-xs font-semibold text-gray-700">
          <span>
            Pagina {pagination.page} di {Math.max(1, Math.ceil(pagination.total / pagination.pageSize) || 1)}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-400 bg-white px-3 py-1 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:opacity-50"
              onClick={() => pagination.onPageChange?.(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
            >
              Prec
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-400 bg-white px-3 py-1 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:opacity-50"
              onClick={() => pagination.onPageChange?.(pagination.page + 1)}
              disabled={pagination.page * pagination.pageSize >= pagination.total}
            >
              Succ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
