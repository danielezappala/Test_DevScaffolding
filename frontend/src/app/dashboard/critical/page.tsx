import Link from "next/link";
import { serverInventoryApi } from "@/lib/server-api";
import { SeverityControls } from "./_components/severity-controls";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";

type SearchParams = Record<string, string | string[] | undefined>;

function toStringValue(value?: string | string[]): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function CriticalStockPage({ searchParams }: { searchParams?: SearchParams }) {
  const severity = toStringValue(searchParams?.severity) as "critical" | "warning" | "all" | undefined;
  const wines = await serverInventoryApi.criticalStock(severity);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <header className="rounded-2xl border border-border bg-card px-4 py-6 shadow-sm sm:px-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Alert stock</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-foreground sm:text-3xl">Stock critici</h1>
            <p className="text-sm text-muted-foreground">Monitor magazzino e riordina rapidamente.</p>
          </div>
          <SeverityControls severity={severity ?? "all"} />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wines.map((wine) => (
          <article key={wine.id} className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg text-foreground sm:text-xl">
                  {wine.name} {wine.vintage}
                </h2>
                <p className="text-sm text-muted-foreground">Qty {wine.quantity} · soglia {wine.threshold ?? 0}</p>
              </div>
              <Badge
                variant={wine.severity === "critical" ? "danger" : "warning"}
                size="sm"
              >
                {wine.severity === "critical" ? "CRITICO" : "ATTENZIONE"}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Fornitore: {wine.supplier?.name ?? "n/d"}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                href={`/dashboard/inventory/${wine.id}`}
                variant="secondary"
                size="sm"
              >
                Apri scheda
              </Button>
              <Button
                href="/dashboard/movements/new"
                variant="outline"
                size="sm"
              >
                Registra ordine
              </Button>
            </div>
          </article>
        ))}
        {wines.length === 0 && <p className="text-sm text-muted-foreground">Nessun vino critico per il filtro selezionato.</p>}
      </section>
    </div>
  );
}
