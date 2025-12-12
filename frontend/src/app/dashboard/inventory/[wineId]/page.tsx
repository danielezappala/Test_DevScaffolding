import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiClientError } from "@/lib/api";
import { serverInventoryApi } from "@/lib/server-api";
import { getWineTypeLabel } from "@/lib/wine-utils";

interface PageProps {
  params: {
    wineId: string;
  };
}

export default async function WineDetailPage({ params }: PageProps) {
  const wineId = Number(params.wineId);
  if (Number.isNaN(wineId)) {
    notFound();
  }

  let wine;
  try {
    wine = await serverInventoryApi.getWine(wineId);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const movements = await serverInventoryApi.listMovements({ wine_id: wineId, limit: 10 });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Scheda vino</p>
          <h1 className="font-display text-3xl text-foreground">
            {wine.name} · <span className="text-muted-foreground">{wine.vintage}</span>
          </h1>
          <p className="text-sm text-muted-foreground">{wine.denomination ?? "Denominazione non indicata"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/dashboard/inventory/${wine.id}/edit`}
            className="inline-flex items-center gap-2 rounded-full border border-primary/70 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:border-primary hover:bg-primary/25"
          >
            Modifica
          </Link>
          <Link
            href={`/dashboard/movements/new?wine_id=${wine.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-accent/70 bg-accent/20 px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:border-accent hover:bg-accent/30"
          >
            Nuovo movimento
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Quantità</p>
          <div className="mt-2 text-4xl font-semibold text-foreground">{wine.quantity}</div>
          <p className="text-xs text-muted-foreground">Soglia impostata {wine.threshold ?? 0} btg</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Tipologia</p>
          <div className="mt-2 text-2xl font-semibold text-foreground">{getWineTypeLabel(wine)}</div>
          <p className="text-xs text-muted-foreground">Barcode {wine.barcode ?? "n/d"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Prezzo medio</p>
          <div className="mt-2 text-2xl font-semibold text-foreground">€ {Number(wine.price).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Produttore: {wine.producer?.name ?? "n/d"}</p>
        </div>
      </section>

      {wine.notes && (
        <section className="rounded-2xl border border-border bg-secondary/40 p-4">
          <h2 className="font-display text-xl text-foreground">Note</h2>
          <p className="mt-2 text-sm text-muted-foreground">{wine.notes}</p>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-foreground">Ultimi movimenti</h2>
      <Link href="/dashboard/movements" className="text-sm font-semibold text-primary-foreground underline-offset-4 hover:underline">
            Vedi tutti
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card/70">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quantità</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nota</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {movements.map((movement) => (
                <tr key={movement.id} className="bg-background">
                  <td className="px-4 py-3 font-semibold capitalize">{movement.type}</td>
                  <td className="px-4 py-3">
                    {movement.type === "out" ? "-" : "+"}
                    {movement.quantity} btg
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{movement.note ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {new Date(movement.timestamp).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-sm text-muted-foreground">
                    Nessun movimento registrato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
