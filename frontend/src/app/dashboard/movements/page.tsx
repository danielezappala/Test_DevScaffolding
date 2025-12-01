import { Plus } from "lucide-react";
import { serverInventoryApi } from "@/lib/server-api";
import type { MovementFilters } from "@/types";
import { MovementFilterControls } from "./_components/filter-controls";
import { InventoryPaginationControls } from "../inventory/_components/pagination-controls";
import { MovementsTable } from "./_components/movements-table";
import { Button } from "@/components/button";

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

  const [movements, wines] = await Promise.all([serverInventoryApi.listMovements(filters), serverInventoryApi.listWines({ limit: 100 })]);
  const filteredMovements = search
    ? movements.filter((movement) => {
      const haystack = `${movement.note ?? ""} ${movement.reference ?? ""}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    })
    : movements;

  const hasNext = movements.length === PER_PAGE;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-4 py-6 shadow-sm sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Movimenti</p>
          <h1 className="font-display text-2xl text-foreground sm:text-3xl">Storico carichi/scarichi</h1>
          <p className="text-sm text-muted-foreground">Consulta i movimenti provenienti dall&apos;API inventory.</p>
        </div>
        <Button href="/dashboard/movements/new" variant="primary">
          <Plus className="h-5 w-5" />
          Nuovo movimento
        </Button>
      </header>

      <MovementFilterControls wines={wines} search={search} type={(type as MovementFilters["type"]) ?? undefined} wineId={wineId ? Number(wineId) : undefined} />

      <MovementsTable movements={filteredMovements} wines={wines} />

      <InventoryPaginationControls page={page} hasNext={hasNext} />
    </div>
  );
}
