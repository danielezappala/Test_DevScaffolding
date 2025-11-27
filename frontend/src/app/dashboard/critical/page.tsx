"use client";
import Link from "next/link";
import { inventoryApi } from "@/lib/api";
import { SeverityControls } from "./_components/severity-controls";

type SearchParams = Record<string, string | string[] | undefined>;

function toStringValue(value?: string | string[]): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function CriticalStockPage({ searchParams }: { searchParams?: SearchParams }) {
  const severity = toStringValue(searchParams?.severity) as "critical" | "warning" | "all" | undefined;
  const wines = await inventoryApi.criticalStock(severity);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-border bg-card px-6 py-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Alert stock</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-foreground">Stock critici</h1>
            <p className="text-sm text-muted-foreground">Monitor magazzino e riordina rapidamente.</p>
          </div>
          <SeverityControls severity={severity ?? "all"} />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {wines.map((wine) => (
          <article key={wine.id} className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-foreground">
                  {wine.name} {wine.vintage}
                </h2>
                <p className="text-sm text-muted-foreground">Qty {wine.quantity} · soglia {wine.threshold ?? 0}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  wine.severity === "critical" ? "bg-destructive/10 text-destructive" : "bg-amber-100/60 text-amber-700"
                }`}
              >
                {wine.severity}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Fornitore: {wine.supplier?.name ?? "n/d"}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href={`/test-devscaffolding/dashboard/inventory/${wine.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary-foreground transition hover:border-primary hover:bg-primary/25"
              >
                Apri scheda
              </Link>
              <Link
                href="/test-devscaffolding/dashboard/movements/new"
                className="inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/20 px-4 py-1 text-xs font-semibold text-accent-foreground transition hover:border-accent hover:bg-accent/30"
              >
                Registra ordine
              </Link>
            </div>
          </article>
        ))}
        {wines.length === 0 && <p className="text-sm text-muted-foreground">Nessun vino critico per il filtro selezionato.</p>}
      </section>
    </div>
  );
}
