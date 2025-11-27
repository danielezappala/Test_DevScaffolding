"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { inventoryApi } from "@/lib/api";
import type { StockMovement, Wine, WineCriticalStock } from "@/types";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Inventario", href: "/dashboard/inventory" },
  { label: "Movimenti", href: "/dashboard/movements" },
  { label: "Fornitori", href: "/dashboard/suppliers" },
  { label: "Stock critici", href: "/dashboard/critical" },
];

const quickActions = [
  { label: "Carico", desc: "Registra ingresso stock", tone: "primary", href: "/dashboard/movements/new?type=in" },
  { label: "Scarico", desc: "Registra uscita stock", tone: "accent", href: "/dashboard/movements/new?type=out" },
  { label: "Nuovo fornitore", desc: "Aggiungi partner", tone: "muted", href: "/dashboard/suppliers/new" },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
        tone: "primary",
      },
      {
        title: "Bottiglie a stock",
        value: loading ? "…" : totalBottles.toLocaleString("it-IT"),
        delta: `${movementBreakdown.in} carichi recenti`,
        tone: "accent",
      },
      {
        title: "Movimenti recenti",
        value: loading ? "…" : movements.length.toString(),
        delta: `${movementBreakdown.in} carichi · ${movementBreakdown.out} scarichi`,
        tone: "muted",
      },
      {
        title: "Fornitori",
        value: loading ? "…" : suppliersCount.toString(),
        delta: `Critical ${critical.length}`,
        tone: "secondary",
      },
    ],
    [loading, wines.length, totalBottles, movementBreakdown, suppliersCount, critical.length, movements.length]
  );

  const wineLookup = useMemo(() => new Map(wines.map((wine) => [wine.id, wine])), [wines]);
  const highlightedWines = useMemo(() => wines.filter((wine) => wine.quantity < (wine.threshold ?? 9999)).slice(0, 2), [wines]);

  const initials = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        short: item.label.charAt(0),
      })),
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            aria-label="Apri/chiudi menu"
            onClick={() => setSidebarOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:border-primary/60 hover:text-primary-foreground"
          >
            <span className="space-y-1">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-4 bg-current" />
              <span className="block h-0.5 w-6 bg-current" />
            </span>
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground">Enò · Etna OPS</span>
            <span className="font-display text-lg leading-tight">Control Room</span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground sm:flex">
            <span className="text-xs font-semibold text-primary-foreground">⌘K</span>
            <input
              aria-label="Cerca vino, annata, fornitore"
              className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Cerca vino, annata, fornitore, movimento..."
            />
          </div>
          <Link
            href="/test-devscaffolding"
            className="rounded-full border border-primary/30 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:border-primary hover:bg-primary/20"
          >
            Home versione
          </Link>
          <span className="rounded-full border border-accent/30 bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground">Vini Etna</span>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-72px)] grid-cols-[auto,1fr]">
        <aside
          className={cn(
            "hidden h-full flex-col border-r border-border bg-card px-3 py-6 transition-all duration-200 sm:flex",
            sidebarOpen ? "w-60" : "w-16"
          )}
        >
          <div className="mb-6 ml-1 text-xs uppercase tracking-wide text-muted-foreground">Navigazione</div>
          <nav className="flex flex-col gap-2">
            {initials.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary/10",
                  item.label === "Dashboard" && "border-primary/50 bg-primary/10"
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary-foreground group-hover:bg-primary/20">
                  {item.short}
                </span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
          <div className="mt-auto rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 text-xs text-muted-foreground">
            Palette vino + ambra · dati live
          </div>
        </aside>

        <main className="relative px-4 py-8 lg:px-10">
          <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
            <section className="space-y-6">
              <header className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-primary-foreground">Dashboard</span>
                  <span>›</span>
                  <span>Cruscotto magazzino</span>
                </div>
                <h1 className="font-display text-3xl text-foreground">Riepilogo giornaliero operazioni di cantina</h1>
                <p className="max-w-2xl text-muted-foreground">
                  Dati da FastAPI (inventario, movimenti, fornitori). Palette calda, tipografia display e indicatori live.
                </p>
                {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
              </header>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                {summaryCards.map((item) => (
                  <div
                    key={item.title}
                    className={cn(
                      "rounded-2xl border p-4 shadow-md transition",
                      item.tone === "primary" && "border-primary/40 bg-primary/10 text-primary-foreground",
                      item.tone === "accent" && "border-accent/40 bg-accent/10 text-accent-foreground",
                      item.tone === "secondary" && "border-secondary/50 bg-secondary/30 text-foreground",
                      item.tone === "muted" && "border-border bg-card text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                      <span className="rounded-full bg-foreground/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                        Live
                      </span>
                    </div>
                    <p className="text-4xl font-semibold leading-none tracking-tight">{item.value}</p>
                    <p className="mt-2 text-xs font-semibold text-foreground/70">{item.delta}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Attività rapide</p>
                    <h2 className="font-display text-xl text-foreground">Carichi &amp; scarichi</h2>
                  </div>
                  <Link
                    href="/test-devscaffolding/dashboard/movements"
                    className="text-sm font-semibold text-primary-foreground underline-offset-4 hover:underline"
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
                        "flex flex-col items-start rounded-xl border px-3 py-3 text-left transition shadow-sm shadow-black/20 hover:-translate-y-0.5",
                        action.tone === "primary" && "border-primary/40 bg-primary/15 text-primary-foreground hover:border-primary/60",
                        action.tone === "accent" && "border-accent/40 bg-accent/15 text-accent-foreground hover:border-accent/60",
                        action.tone === "muted" && "border-border/60 bg-secondary/40 text-foreground hover:border-border"
                      )}
                    >
                      <span className="text-sm font-semibold">{action.label}</span>
                      <span className="text-xs text-muted-foreground">{action.desc}</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {movements.slice(0, 2).map((movement) => {
                    const wine = wineLookup.get(movement.wine_id);
                    return (
                      <div key={movement.id} className="rounded-lg border border-border bg-secondary p-3 text-sm text-muted-foreground">
                        <span className="font-semibold capitalize text-foreground">{movement.type}</span> ·{" "}
                        {movement.type === "out" ? "-" : "+"}
                        {movement.quantity} btg · {wine ? wine.name : `Wine ${movement.wine_id}`} ·{" "}
                        {new Date(movement.timestamp).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    );
                  })}
                  {movements.length === 0 && !loading && (
                    <div className="rounded-lg border border-border bg-secondary p-3 text-sm text-muted-foreground">
                      Nessun movimento trovato
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg">Stock critici</h3>
                    <span className="text-xs text-muted-foreground">Soglie minime</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {critical.slice(0, 5).map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary px-3 py-2 text-sm"
                      >
                        <Link
                          href={`/test-devscaffolding/dashboard/inventory/${row.id}`}
                          className="flex items-center gap-2 font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              row.severity === "critical" && "bg-red-500",
                              row.severity === "warning" && "bg-amber-400"
                            )}
                          />
                          {row.name} {row.vintage}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {row.quantity} btg · soglia {row.threshold ?? 0}
                        </div>
                      </div>
                    ))}
                    {!loading && critical.length === 0 && <p className="text-sm text-muted-foreground">Nessun vino sotto soglia.</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg">Etichette da attenzionare</h3>
                    <span className="text-xs text-muted-foreground">Campione inventario</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {highlightedWines.map((wine) => (
                      <div key={wine.id} className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary px-3 py-2 text-sm">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {wine.name} · {wine.vintage}
                          </span>
                          <span className="text-xs text-muted-foreground">Qty: {wine.quantity} btg</span>
                        </div>
                        <Link
                          href={`/test-devscaffolding/dashboard/inventory/${wine.id}`}
                          className="rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold text-primary-foreground transition hover:border-primary hover:bg-primary/10"
                        >
                          Scheda
                        </Link>
                      </div>
                    ))}
                    {highlightedWines.length === 0 && !loading && (
                      <p className="text-sm text-muted-foreground">Inventario sopra le soglie definite.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-primary/40 bg-card p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Stato API</p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-primary-foreground">Backend live</p>
                    <p className="text-sm text-muted-foreground">/test-devscaffolding</p>
                  </div>
                  <span className={cn("h-3 w-3 rounded-full ring-2", error ? "bg-amber-400 ring-amber-400/40" : "bg-emerald-400 ring-emerald-400/40")} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Naviga verso inventario, movimenti e fornitori per interagire con le API FastAPI. Palette calda, tipografia display per richiamare
                  l&apos;enoteca.
                </p>
                <Link
                  href="/test-devscaffolding"
                  className="mt-3 inline-flex items-center justify-center rounded-lg border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:border-primary hover:bg-primary/25"
                >
                  Torna alla pagina versione
                </Link>
              </div>

              <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm text-muted-foreground shadow-sm">
                <p className="text-xs uppercase tracking-wide text-accent-foreground">Guideline UI</p>
                <ul className="mt-2 space-y-2">
                  <li>• Bordo sottile + blur per richiamare vetro e luci soffuse.</li>
                  <li>• Dati dinamici da API: versioni, stock, movimenti.</li>
                  <li>• Accenti vino (rosso) e ambra per call-to-action.</li>
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
