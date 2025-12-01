"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { inventoryApi } from "@/lib/api";
import type { StockMovement, Wine, WineCriticalStock } from "@/types";

const quickActions = [
  { label: "Carico", desc: "Registra ingresso stock", tone: "primary", href: "/dashboard/movements/new?type=in" },
  { label: "Scarico", desc: "Registra uscita stock", tone: "accent", href: "/dashboard/movements/new?type=out" },
  { label: "Nuovo fornitore", desc: "Aggiungi partner", tone: "muted", href: "/dashboard/suppliers/new" },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wines, setWines] = useState<Wine[]>([]);
  const [critical, setCritical] = useState<WineCriticalStock[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [suppliersCount, setSuppliersCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [winesData, suppliersData, movementsData, criticalData] = await Promise.all([
          inventoryApi.listWines({ limit: 50 }),
          inventoryApi.listSuppliers(),
          inventoryApi.listMovements({ limit: 6 }),
          inventoryApi.criticalStock(),
        ]);

        if (!active) return;
        setWines(winesData);
        setSuppliersCount(suppliersData.length);
        setMovements(movementsData);
        setCritical(criticalData);
      } catch (err) {
        console.error(err);
        if (active) {
          setError("Errore nel recupero dati dal backend.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const totalBottles = useMemo(() => wines.reduce((acc, wine) => acc + (wine.quantity ?? 0), 0), [wines]);
  const movementBreakdown = useMemo(() => {
    return movements.reduce(
      (acc, movement) => {
        acc[movement.type] = (acc[movement.type] ?? 0) + movement.quantity;
        return acc;
      },
      { in: 0, out: 0, adjust: 0 } as Record<string, number>
    );
  }, [movements]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Etichette attive",
        value: loading ? "…" : wines.length.toString(),
        delta: `${critical.length} stock critici`,
        color: "teal",
        href: "/dashboard/inventory",
      },
      {
        title: "Bottiglie a stock",
        value: loading ? "…" : totalBottles.toLocaleString("it-IT"),
        delta: `${movementBreakdown.in} carichi recenti`,
        color: "teal",
        href: "/dashboard/inventory",
      },
      {
        title: "Movimenti recenti",
        value: loading ? "…" : movements.length.toString(),
        delta: `${movementBreakdown.in} carichi · ${movementBreakdown.out} scarichi`,
        color: "sage",
        href: "/dashboard/movements",
      },
      {
        title: "Fornitori",
        value: loading ? "…" : suppliersCount.toString(),
        delta: `${critical.length} critici`,
        color: "taupe",
        href: "/dashboard/suppliers",
      },
    ],
    [loading, wines.length, totalBottles, movementBreakdown, suppliersCount, critical.length, movements.length]
  );

  const wineLookup = useMemo(() => new Map(wines.map((wine) => [wine.id, wine])), [wines]);
  const highlightedWines = useMemo(() => wines.filter((wine) => wine.quantity < (wine.threshold ?? 9999)).slice(0, 2), [wines]);

  return (
    <div className="px-4 py-8 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <section className="space-y-6">
          <header className="flex flex-col gap-3">
            <h1 className="font-display text-3xl text-foreground">Riepilogo giornaliero operazioni di cantina</h1>
            {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
          </header>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            {summaryCards.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "rounded-2xl border p-4 shadow-md transition cursor-pointer hover:shadow-lg hover:-translate-y-0.5",
                  item.color === "teal" && "border-earth-teal/40 bg-earth-teal/10 hover:border-earth-teal/60 hover:bg-earth-teal/20",
                  item.color === "sage" && "border-earth-sage/40 bg-earth-sage/10 hover:border-earth-sage/60 hover:bg-earth-sage/20",
                  item.color === "taupe" && "border-earth-taupe/40 bg-earth-taupe/10 hover:border-earth-taupe/60 hover:bg-earth-taupe/20",
                  item.color === "brick" && "border-earth-brick/40 bg-earth-brick/10 hover:border-earth-brick/60 hover:bg-earth-brick/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground/80">{item.title}</p>
                </div>
                <p className="text-4xl font-bold leading-none tracking-tight text-foreground">{item.value}</p>
                <p className="mt-2 text-xs font-semibold text-foreground/80">{item.delta}</p>
              </Link>
            ))}
          </div>

          <div className="rounded-2xl border border-earth-sage/40 bg-earth-sage/10 p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground/70">Attività rapide</p>
                <h2 className="font-display text-xl font-bold text-foreground">Carichi &amp; scarichi</h2>
              </div>
              <Link
                href="/dashboard/movements"
                className="text-sm font-semibold text-earth-teal underline-offset-4 hover:underline"
              >
                Vai ai movimenti
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={cn(
                    "flex flex-col items-start rounded-xl border px-3 py-3 text-left transition shadow-sm hover:-translate-y-0.5",
                    action.tone === "primary" && "border-earth-teal/50 bg-earth-teal/20 hover:border-earth-teal/70 hover:bg-earth-teal/30",
                    action.tone === "accent" && "border-earth-terracotta/50 bg-earth-terracotta/20 hover:border-earth-terracotta/70 hover:bg-earth-terracotta/30",
                    action.tone === "muted" && "border-earth-taupe/50 bg-earth-taupe/20 hover:border-earth-taupe/70 hover:bg-earth-taupe/30"
                  )}
                >
                  <span className="text-sm font-bold text-foreground">{action.label}</span>
                  <span className="text-xs font-medium text-foreground/80">{action.desc}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {movements.slice(0, 2).map((movement) => {
                const wine = wineLookup.get(movement.wine_id);
                return (
                  <div key={movement.id} className="rounded-lg border border-earth-sage/30 bg-earth-sage/20 p-3 text-sm text-foreground/80">
                    <span className="font-semibold capitalize text-foreground">{movement.type}</span> ·{" "}
                    {movement.type === "out" ? "-" : "+"}
                    {movement.quantity} btg · {wine ? wine.name : `Wine ${movement.wine_id}`} ·{" "}
                    {new Date(movement.timestamp).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                );
              })}
              {movements.length === 0 && !loading && (
                <div className="rounded-lg border border-earth-sage/30 bg-earth-sage/20 p-3 text-sm text-foreground/80">
                  Nessun movimento trovato
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-earth-brick/40 bg-earth-brick/10 p-4 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-foreground">Stock critici</h3>
                <Link
                  href="/dashboard/critical"
                  className="text-xs font-semibold text-earth-brick underline-offset-4 hover:underline"
                >
                  Vedi tutti
                </Link>
              </div>
              <div className="mt-3 space-y-2">
                {critical.slice(0, 5).map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between rounded-lg border border-earth-brick/30 bg-earth-brick/20 px-3 py-2 text-sm"
                  >
                    <Link
                      href={`/dashboard/inventory/${row.id}`}
                      className="flex items-center gap-2 font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          row.severity === "critical" && "bg-earth-brick",
                          row.severity === "warning" && "bg-earth-terracotta"
                        )}
                      />
                      {row.name} {row.vintage}
                    </Link>
                    <div className="text-xs text-foreground/70">
                      {row.quantity} btg · soglia {row.threshold ?? 0}
                    </div>
                  </div>
                ))}
                {!loading && critical.length === 0 && <p className="text-sm text-foreground/70">Nessun vino sotto soglia.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-earth-teal/40 bg-earth-teal/10 p-4 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-foreground">Etichette da attenzionare</h3>
                <span className="text-xs text-foreground/70">Campione inventario</span>
              </div>
              <div className="mt-3 space-y-2">
                {highlightedWines.map((wine) => (
                  <div key={wine.id} className="flex items-center justify-between rounded-lg border border-earth-teal/30 bg-earth-teal/20 px-3 py-2 text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {wine.name} · {wine.vintage}
                      </span>
                      <span className="text-xs text-foreground/70">Qty: {wine.quantity} btg</span>
                    </div>
                    <Link
                      href={`/dashboard/inventory/${wine.id}`}
                      className="rounded-full border border-earth-teal/70 bg-earth-teal/30 px-4 py-1.5 text-xs font-semibold text-foreground transition hover:border-earth-teal hover:bg-earth-teal/40"
                    >
                      Scheda
                    </Link>
                  </div>
                ))}
                {highlightedWines.length === 0 && !loading && (
                  <p className="text-sm text-foreground/70">Inventario sopra le soglie definite.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

}
