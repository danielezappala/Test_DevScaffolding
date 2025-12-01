import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Wine } from "@/types";
import { getWineTypeLabel } from "@/lib/wine-utils";

interface WineCardProps {
  wine: Wine;
  href?: string;
  actionsSlot?: React.ReactNode;
  className?: string;
}

function getStockSeverity(wine: Wine) {
  if (wine.quantity <= 0) return { label: "Esaurito", tone: "critical" as const };
  if (wine.threshold && wine.quantity < wine.threshold) {
    return { label: "Sotto soglia", tone: "warning" as const };
  }
  return { label: "In stock", tone: "ok" as const };
}

export function WineCard({ wine, href, actionsSlot, className }: WineCardProps) {
  const severity = getStockSeverity(wine);
  const infoItems = [
    { label: "Annata", value: wine.vintage },
    { label: "Tipo", value: getWineTypeLabel(wine) },
    { label: "Denominazione", value: wine.denomination ?? "—" },
    { label: "Fornitore", value: wine.supplier?.name ?? "—" },
  ];

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl text-foreground">
            {wine.name} <span className="text-muted-foreground">{wine.vintage}</span>
          </h3>
          <p className="text-sm text-muted-foreground">{wine.denomination ?? "—"}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
            severity.tone === "critical" && "bg-destructive/10 text-destructive",
            severity.tone === "warning" && "bg-amber-100/40 text-amber-600",
            severity.tone === "ok" && "bg-emerald-100/40 text-emerald-600"
          )}
        >
          {severity.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-foreground/90">
        {infoItems.map((item) => (
          <div key={item.label} className="rounded-xl border border-border/70 bg-background/40 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className="font-medium">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-semibold text-foreground">{wine.quantity}</div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Bottiglie
            <div className="text-foreground/80">Soglia {wine.threshold ?? 0}</div>
          </div>
        </div>
        <div className="text-right text-sm font-semibold text-foreground">
          € {Number(wine.price).toFixed(2)}
          <p className="text-xs font-medium text-muted-foreground">per bottiglia</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {wine.barcode && <span className="rounded-full border border-border px-3 py-1 text-foreground/80">Barcode {wine.barcode}</span>}
        <span className="rounded-full border border-border px-3 py-1 text-foreground/80">
          Supplier ID: {wine.supplier_id ?? "n/d"}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:border-primary hover:bg-primary/20"
          >
            Dettagli
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">Dettagli non disponibili</span>
        )}
        {actionsSlot}
      </div>
    </article>
  );
}
