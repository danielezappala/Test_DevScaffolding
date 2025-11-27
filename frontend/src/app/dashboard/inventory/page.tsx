"use client";
import Link from "next/link";
import { inventoryApi } from "@/lib/api";
import { DataTable } from "@/components/data-table";
import { WineCard } from "@/components/wine-card";
import type { WineFilters } from "@/types";
import { InventoryFilterControls } from "./_components/filter-controls";
import { InventoryPaginationControls } from "./_components/pagination-controls";

type SearchParams = Record<string, string | string[] | undefined>;

const PER_PAGE = 20;

function toNumber(value?: string | string[]): number | undefined {
  if (!value) return undefined;
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toStringValue(value?: string | string[]): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function InventoryPage({ searchParams }: { searchParams?: SearchParams }) {
  const page = Math.max(1, Number(toStringValue(searchParams?.page) ?? "1"));
  const search = toStringValue(searchParams?.q);
  const type = toStringValue(searchParams?.type);
  const supplierId = toNumber(searchParams?.supplier_id);
  const availableOnly = searchParams?.available_only === "true" || searchParams?.available_only === "1";
  const belowThreshold = searchParams?.below_threshold === "true" || searchParams?.below_threshold === "1";

  const filters: WineFilters = {
    skip: (page - 1) * PER_PAGE,
    limit: PER_PAGE,
    search: search || undefined,
    type: type && type !== "all" ? (type as WineFilters["type"]) : undefined,
    supplier_id: supplierId,
    available_only: availableOnly || undefined,
    below_threshold: belowThreshold || undefined,
  };

  const [wines, suppliers, criticalStock] = await Promise.all([
    inventoryApi.listWines(filters),
    inventoryApi.listSuppliers(),
    inventoryApi.criticalStock(),
  ]);

  const hasNext = wines.length === PER_PAGE;
  const totalQuantity = wines.reduce((acc, wine) => acc + (wine.quantity ?? 0), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card/70 px-6 py-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Inventario · Etna</p>
          <h1 className="font-display text-3xl text-foreground">Lista vini e stock</h1>
          <p className="text-sm text-muted-foreground">Filtra per tipologia, annata e fornitore. Dati live da FastAPI.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary-foreground">
            {wines.length} etichette · {totalQuantity} bottiglie
          </div>
          <Link
            href="/test-devscaffolding/dashboard/inventory/new"
            className="inline-flex items-center gap-2 rounded-full border border-primary/70 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:border-primary hover:bg-primary/25"
          >
            + Nuovo vino
          </Link>
        </div>
      </header>

      <InventoryFilterControls
        suppliers={suppliers}
        search={search}
        type={(type as WineFilters["type"]) ?? undefined}
        supplierId={supplierId}
        availableOnly={availableOnly}
        belowThreshold={belowThreshold}
      />

      <DataTable
        data={wines}
        columns={[
          {
            id: "name",
            header: "Vino",
            render: (wine) => (
              <div className="flex flex-col">
                <Link
                  href={`/test-devscaffolding/dashboard/inventory/${wine.id}`}
                  className="font-semibold text-primary-foreground underline-offset-4 hover:underline"
                >
                  {wine.name}
                </Link>
                <span className="text-xs text-muted-foreground">{wine.denomination ?? "—"}</span>
              </div>
            ),
          },
          { id: "vintage", header: "Annata", accessor: "vintage" },
          { id: "type", header: "Tipo", accessor: "type" },
          {
            id: "quantity",
            header: "Qty",
            render: (wine) => (
              <div className="text-right">
                <p className="font-semibold">{wine.quantity}</p>
                <p className="text-xs text-muted-foreground">soglia {wine.threshold ?? 0}</p>
              </div>
            ),
            align: "right",
          },
          {
            id: "price",
            header: "Prezzo",
            render: (wine) => <span>€ {Number(wine.price).toFixed(2)}</span>,
          },
          {
            id: "supplier",
            header: "Fornitore",
            render: (wine) => wine.supplier?.name ?? "—",
          },
        ]}
        emptyState="Nessun vino trovato. Prova ad aggiornare i filtri."
      />

      <InventoryPaginationControls page={page} hasNext={hasNext} />

      <section className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-3">
          <h2 className="font-display text-2xl text-foreground">Cards rapide</h2>
          <p className="text-sm text-muted-foreground">Visualizza al volo stato e fornitore delle etichette filtrate.</p>
          <div className="grid gap-4 md:grid-cols-2">
            {wines.slice(0, 4).map((wine) => (
              <WineCard key={wine.id} wine={wine} href={`/test-devscaffolding/dashboard/inventory/${wine.id}`} />
            ))}
            {wines.length === 0 && <p className="text-sm text-muted-foreground">Nessun vino da mostrare nella vista card.</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl text-foreground">Stock critici</h3>
            <Link href="/test-devscaffolding/dashboard/critical" className="text-xs font-semibold text-primary-foreground underline-offset-4 hover:underline">
              Tutti
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {criticalStock.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold text-foreground">
                    {item.name} {item.vintage}
                  </p>
                  <p className="text-xs text-muted-foreground">Qty {item.quantity} · soglia {item.threshold ?? 0}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.severity === "critical" ? "bg-destructive/10 text-destructive" : "bg-amber-100/50 text-amber-700"
                  }`}
                >
                  {item.severity}
                </span>
              </div>
            ))}
            {criticalStock.length === 0 && <p className="text-sm text-muted-foreground">Nessuna etichetta sotto soglia.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
