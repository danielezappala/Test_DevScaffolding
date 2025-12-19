"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { inventoryApi } from "@/lib/api";
import { DataTable, type SortDirection } from "@/components/data-table";
import type { Wine, Supplier, WineCriticalStock, WineFilters } from "@/types";
import { InventoryFilterControls } from "./_components/filter-controls";
import { InventoryPaginationControls } from "./_components/pagination-controls";
import { getWineTypeLabel } from "@/lib/wine-utils";
import { getWineBadgeVariant } from "@/lib/wine-badge-utils";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";

interface WinesTableProps {
  wines: Wine[];
  companies: Supplier[]; // Produttori e Fornitori
}

function WinesTable({ wines, companies }: WinesTableProps) {
  const [sortState, setSortState] = useState<{ columnId?: string; direction?: SortDirection }>({});

  const sortedWines = useMemo(() => {
    if (!sortState.columnId || !sortState.direction) {
      return wines;
    }

    const sorted = [...wines].sort((a, b) => {
      type SortablePrimitive = string | number;
      let aValue: SortablePrimitive;
      let bValue: SortablePrimitive;

      switch (sortState.columnId) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "vintage":
          aValue = a.vintage;
          bValue = b.vintage;
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "quantity":
          aValue = a.quantity || 0;
          bValue = b.quantity || 0;
          break;
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case "producer": {
          const producerA = companies.find((c) => c.id === a.producer_id);
          const producerB = companies.find((c) => c.id === b.producer_id);
          aValue = producerA?.name || "";
          bValue = producerB?.name || "";
          break;
        }
        case "supplier": {
          const supplierA = companies.find((c) => c.id === a.supplier_id);
          const supplierB = companies.find((c) => c.id === b.supplier_id);
          aValue = supplierA?.name || "";
          bValue = supplierB?.name || "";
          break;
        }
        default:
          return 0;
      }

      if (aValue < bValue) return sortState.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortState.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [wines, companies, sortState]);

  const handleSortChange = (columnId: string, direction: SortDirection) => {
    setSortState({ columnId, direction });
  };

  return (
    <DataTable
      data={sortedWines}
      sortState={sortState}
      onSortChange={handleSortChange}
      columns={[
        {
          id: "name",
          header: "Vino",
          sortable: true,
          render: (wine) => (
            <div className="flex flex-col">
              <Link
                href={`/inventory/${wine.id}`}
                className="font-semibold text-foreground underline-offset-4 hover:underline hover:text-primary"
              >
                {wine.name}
              </Link>
              <span className="text-xs text-muted-foreground">{wine.denomination ?? "—"}</span>
            </div>
          ),
        },
        { id: "vintage", header: "Annata", accessor: "vintage", sortable: true },
        {
          id: "type",
          header: "Tipo",
          sortable: true,
          render: (wine) => (
            <Badge variant={getWineBadgeVariant(wine)}>
              {getWineTypeLabel(wine)}
            </Badge>
          ),
        },
        { id: "quantity", header: "Qty", accessor: "quantity", sortable: true },
        {
          id: "price",
          header: "Prezzo",
          sortable: true,
          render: (wine) => (wine.price ? `€${wine.price.toFixed(2)}` : "—"),
        },
        {
          id: "producer",
          header: "Produttore",
          sortable: true,
          render: (wine) => {
            const producer = companies.find((c) => c.id === wine.producer_id);
            return producer ? producer.name : "—";
          },
        },
        {
          id: "supplier",
          header: "Fornitore",
          sortable: true,
          render: (wine) => {
            const supplier = companies.find((c) => c.id === wine.supplier_id);
            return supplier ? supplier.name : "—";
          },
        },
        {
          id: "actions",
          header: "Azioni",
          render: (wine) => (
            <div className="flex items-center gap-2">
              <Button
                href={`/inventory/${wine.id}`}
                variant="ghost"
                size="sm"
              >
                Dettagli
              </Button>
              <Button
                href={`/inventory/${wine.id}/edit`}
                variant="outline"
                size="sm"
              >
                Modifica
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
}

const PER_PAGE = 20;

function toNumber(value?: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export default function InventoryPageContent() {
  const searchParams = useSearchParams();
  const [wines, setWines] = useState<Wine[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [criticalStock, setCriticalStock] = useState<WineCriticalStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const search = searchParams.get("q") || undefined;
  const type = searchParams.get("type") || undefined;
  const producerId = toNumber(searchParams.get("producer_id"));
  const availableOnly = searchParams.get("available_only") === "true" || searchParams.get("available_only") === "1";
  const belowThreshold = searchParams.get("below_threshold") === "true" || searchParams.get("below_threshold") === "1";

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const filters: WineFilters = {
          skip: (page - 1) * PER_PAGE,
          limit: PER_PAGE,
          search: search || undefined,
          type: type && type !== "all" ? (type as WineFilters["type"]) : undefined,
          producer_id: producerId,
          available_only: availableOnly || undefined,
          below_threshold: belowThreshold || undefined,
        };

        const [winesData, suppliersData, criticalData] = await Promise.all([
          inventoryApi.listWines(filters),
          inventoryApi.listSuppliers(),
          inventoryApi.criticalStock(),
        ]);

        if (!active) return;
        setWines(winesData);
        setSuppliers(suppliersData);
        setCriticalStock(criticalData);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Errore nel caricamento dati");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => { active = false; };
  }, [page, search, type, producerId, availableOnly, belowThreshold]);

  const hasNext = wines.length === PER_PAGE;
  const totalQuantity = wines.reduce((acc, wine) => acc + (wine.quantity ?? 0), 0);

  if (error) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive">Errore</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card/70 px-4 py-6 shadow-sm sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Inventario · Etna</p>
          <h1 className="font-display text-2xl text-foreground sm:text-3xl">Lista vini e stock</h1>
          <p className="text-sm text-muted-foreground">Filtra per tipologia, annata e produttore. Dati live da FastAPI.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="info" size="lg">
            {loading ? "..." : `${wines.length} etichette · ${totalQuantity} bottiglie`}
          </Badge>
          <Button href="/inventory/new" variant="primary">
            <Plus className="h-5 w-5" />
            Nuovo vino
          </Button>
        </div>
      </header>

      <InventoryFilterControls
        companies={suppliers}
        search={search}
        type={(type as WineFilters["type"]) ?? undefined}
        producerId={producerId}
        availableOnly={availableOnly}
        belowThreshold={belowThreshold}
      />

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      ) : (
        <WinesTable wines={wines} companies={suppliers} />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 font-display text-lg text-foreground sm:text-xl">Cards rapide</h3>
          <p className="text-sm text-muted-foreground">
            Visualizza al volo stato e produttore delle etichette filtrate.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Nessun vino da mostrare nella vista card.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 font-display text-lg text-foreground sm:text-xl">Stock critici</h3>
          {criticalStock.length > 0 ? (
            <ul className="space-y-2">
              {criticalStock.slice(0, 3).map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.name}</span>
                  <Badge
                    variant={item.severity === "critical" ? "danger" : "warning"}
                    size="sm"
                  >
                    {item.quantity} btg
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nessuna etichetta sotto soglia.</p>
          )}
        </div>
      </div>

      <InventoryPaginationControls page={page} hasNext={hasNext} />
    </div>
  );
}
