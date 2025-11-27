"use client";
import Link from "next/link";
import { inventoryApi } from "@/lib/api";
import type { MovementFilters } from "@/types";
import { DataTable } from "@/components/data-table";
import { MovementFilterControls } from "./_components/filter-controls";
import { InventoryPaginationControls } from "../inventory/_components/pagination-controls";

const PER_PAGE = 25;

type SearchParams = Record<string, string | string[] | undefined>;

function toStringValue(value?: string | string[]): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function MovementsPage({ searchParams }: { searchParams?: SearchParams }) {
  const page = Math.max(1, Number(toStringValue(searchParams?.page) ?? "1"));
  const type = toStringValue(searchParams?.type);
  const wineId = toStringValue(searchParams?.wine_id);
  const search = toStringValue(searchParams?.q);

  const filters: MovementFilters = {
    skip: (page - 1) * PER_PAGE,
    limit: PER_PAGE,
    type: type && type !== "all" ? (type as MovementFilters["type"]) : undefined,
    wine_id: wineId ? Number(wineId) : undefined,
  };

  const [movements, wines] = await Promise.all([inventoryApi.listMovements(filters), inventoryApi.listWines({ limit: 100 })]);
  const filteredMovements = search
    ? movements.filter((movement) => {
        const haystack = `${movement.note ?? ""} ${movement.reference ?? ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
    : movements;

  const hasNext = movements.length === PER_PAGE;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Movimenti</p>
          <h1 className="font-display text-3xl text-foreground">Storico carichi/scarichi</h1>
          <p className="text-sm text-muted-foreground">Consulta i movimenti provenienti dall&apos;API inventory.</p>
        </div>
        <Link
          href="/test-devscaffolding/dashboard/movements/new"
          className="inline-flex items-center gap-2 rounded-full border border-primary/70 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:border-primary hover:bg-primary/25"
        >
          + Nuovo movimento
        </Link>
      </header>

      <MovementFilterControls wines={wines} search={search} type={(type as MovementFilters["type"]) ?? undefined} wineId={wineId ? Number(wineId) : undefined} />

      <DataTable
        data={filteredMovements}
        columns={[
          {
            id: "type",
            header: "Tipo",
            render: (movement) => (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  movement.type === "in"
                    ? "bg-emerald-100/60 text-emerald-700"
                    : movement.type === "out"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-amber-100/60 text-amber-700"
                }`}
              >
                {movement.type}
              </span>
            ),
          },
          {
            id: "wine",
            header: "Vino",
            render: (movement) => {
              const wine = wines.find((record) => record.id === movement.wine_id);
              return wine ? (
                <Link
                  href={`/test-devscaffolding/dashboard/inventory/${wine.id}`}
                  className="font-semibold text-primary-foreground underline-offset-4 hover:underline"
                >
                  {wine.name} {wine.vintage}
                </Link>
              ) : (
                `ID ${movement.wine_id}`
              );
            },
          },
          {
            id: "quantity",
            header: "Quantità",
            render: (movement) => `${movement.type === "out" ? "-" : "+"}${movement.quantity}`,
          },
          {
            id: "note",
            header: "Note",
            render: (movement) => movement.note ?? "—",
          },
          {
            id: "timestamp",
            header: "Data",
            render: (movement) => new Date(movement.timestamp).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" }),
          },
        ]}
        emptyState="Nessun movimento trovato per i filtri selezionati."
      />

      <InventoryPaginationControls page={page} hasNext={hasNext} />
    </div>
  );
}
