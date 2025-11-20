"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/test-devscaffolding/dashboard" },
  { label: "Inventario", href: "#inventario" },
  { label: "Movimenti", href: "#movimenti" },
  { label: "Fornitori", href: "#fornitori" },
  { label: "Report", href: "#report" },
];

const quickActions = [
  { label: "Carico", desc: "Registra ingresso stock", tone: "primary" },
  { label: "Scarico", desc: "Registra uscita stock", tone: "accent" },
  { label: "Nuovo fornitore", desc: "Aggiungi partner", tone: "muted" },
];

const riepilogo = [
  { title: "Etichette attive", value: "128", delta: "+6 questa settimana", tone: "primary" },
  { title: "Bottiglie a stock", value: "4.320", delta: "+240 carichi", tone: "accent" },
  { title: "Movimenti oggi", value: "38", delta: "12 carichi · 26 scarichi", tone: "muted" },
  { title: "Fornitori", value: "42", delta: "2 nuovi", tone: "secondary" },
];

const stockCritici = [
  { nome: "Etna Rosso DOC 2019", qty: 12, soglia: 24, stato: "rosso" },
  { nome: "Carricante 2021", qty: 30, soglia: 30, stato: "giallo" },
  { nome: "Nerello Mascalese 2020", qty: 58, soglia: 50, stato: "verde" },
];

const ultimiMovimenti = [
  { tipo: "Carico", dettaglio: "+120 btg · Forn. Etna Nord", ora: "12:32" },
  { tipo: "Scarico", dettaglio: "-36 btg · Ordine e-commerce", ora: "13:05" },
  { tipo: "Carico", dettaglio: "+48 btg · Lotti annata 2022", ora: "15:18" },
];

const ordiniInArrivo = [
  { nome: "Etna Bianco 2022", eta: "Domani", qty: 90 },
  { nome: "Rosato DOC 2023", eta: "2 giorni", qty: 60 },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            aria-label="Apri/chiudi menu"
            onClick={() => setSidebarOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:border-primary/60 hover:text-primary-foreground"
          >
            <span className="space-y-1">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-4 bg-current" />
              <span className="block h-0.5 w-6 bg-current" />
            </span>
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground">
              Enò · Etna OPS
            </span>
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
          <span className="rounded-full border border-accent/30 bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground">
            Vini Etna
          </span>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-72px)] grid-cols-[auto,1fr]">
        {/* Sidebar */}
        <aside
          className={cn(
            "hidden h-full flex-col border-r border-border bg-card px-3 py-6 transition-all duration-200 sm:flex",
            sidebarOpen ? "w-60" : "w-16"
          )}
        >
          <div className="mb-6 ml-1 text-xs uppercase tracking-wide text-muted-foreground">
            Navigazione
          </div>
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
            Palette vino + ambra · ispirata a enoetnawinehouse.it
          </div>
        </aside>

        {/* Main */}
        <main className="relative px-4 py-8 lg:px-10">
          <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
            <section className="space-y-6">
              <header className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-primary-foreground">Dashboard</span>
                  <span>›</span>
                  <span>Cruscotto magazzino</span>
                </div>
                <h1 className="font-display text-3xl text-foreground">
                  Riepilogo giornaliero operazioni di cantina
                </h1>
                <p className="max-w-2xl text-muted-foreground">
                  Gestisci carichi, scarichi e monitora le etichette più calde dell&apos;Etna.
                  Naviga dal menu laterale o usa le scorciatoie rapide.
                </p>
              </header>

              {/* Riepilogo Cards */}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                {riepilogo.map((item) => (
                  <div
                    key={item.title}
                    className={cn(
                      "rounded-2xl border p-4 shadow-md transition",
                      item.tone === "primary" &&
                        "border-primary/40 bg-primary/10 text-primary-foreground",
                      item.tone === "accent" &&
                        "border-accent/40 bg-accent/10 text-accent-foreground",
                      item.tone === "secondary" &&
                        "border-secondary/50 bg-secondary/30 text-foreground",
                      item.tone === "muted" &&
                        "border-border bg-card text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                      <span className="rounded-full bg-foreground/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                        Live
                      </span>
                    </div>
                    <p className="text-4xl font-semibold leading-none tracking-tight">
                      {item.value}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-foreground/70">{item.delta}</p>
                  </div>
                ))}
              </div>

              {/* Attività */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Attività rapide</p>
                    <h2 className="font-display text-xl text-foreground">Carichi &amp; scarichi</h2>
                  </div>
                  <Link
                    href="#movimenti"
                    className="text-sm font-semibold text-primary-foreground underline-offset-4 hover:underline"
                  >
                    Vai ai movimenti
                  </Link>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      className={cn(
                        "flex flex-col items-start rounded-xl border px-3 py-3 text-left transition shadow-sm shadow-black/20 hover:-translate-y-0.5",
                        action.tone === "primary" &&
                          "border-primary/40 bg-primary/15 text-primary-foreground hover:border-primary/60",
                        action.tone === "accent" &&
                          "border-accent/40 bg-accent/15 text-accent-foreground hover:border-accent/60",
                        action.tone === "muted" &&
                          "border-border/60 bg-secondary/40 text-foreground hover:border-border"
                      )}
                    >
                      <span className="text-sm font-semibold">{action.label}</span>
                      <span className="text-xs text-muted-foreground">{action.desc}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {ultimiMovimenti.slice(0, 2).map((m, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-secondary p-3 text-sm text-muted-foreground"
                    >
                      {m.tipo}: {m.dettaglio} · {m.ora}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg">Stock critici</h3>
                    <span className="text-xs text-muted-foreground">Soglie minime</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {stockCritici.map((row) => (
                      <div
                        key={row.nome}
                        className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              row.stato === "rosso" && "bg-red-500",
                              row.stato === "giallo" && "bg-amber-400",
                              row.stato === "verde" && "bg-emerald-500"
                            )}
                          />
                          <span className="font-medium text-foreground">{row.nome}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.qty} btg · soglia {row.soglia}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg">Ordini in arrivo</h3>
                    <span className="text-xs text-muted-foreground">Next 48h</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {ordiniInArrivo.map((o) => (
                      <div
                        key={o.nome}
                        className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary px-3 py-2 text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{o.nome}</span>
                          <span className="text-xs text-muted-foreground">Qty: {o.qty} btg</span>
                        </div>
                        <span className="rounded-full bg-accent/30 px-3 py-1 text-xs font-semibold text-accent-foreground">
                          {o.eta}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Pannello destro */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-primary/40 bg-card p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Stato API</p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-primary-foreground">Backend live</p>
                    <p className="text-sm text-muted-foreground">/test-devscaffolding</p>
                  </div>
                  <span className="h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-emerald-400/40" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Usa il menu per navigare a inventario, movimenti e fornitori. Palette calda,
                  tipografia display per richiamare l&apos;enoteca.
                </p>
                <Link
                  href="/test-devscaffolding"
                  className="mt-3 inline-flex items-center justify-center rounded-lg border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:border-primary hover:bg-primary/25"
                >
                  Torna alla pagina versione
                </Link>
              </div>

              <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm text-muted-foreground shadow-sm">
                <p className="text-xs uppercase tracking-wide text-accent-foreground">
                  Guideline UI
                </p>
                <ul className="mt-2 space-y-2">
                  <li>• Bordo sottile + blur per richiamare vetro e luci soffuse.</li>
                  <li>• Titoli in Playfair, testi in Manrope.</li>
                  <li>• Accenti vino (rosso) e ambra per evidenziare call-to-action.</li>
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
