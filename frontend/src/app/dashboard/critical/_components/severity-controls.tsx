"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface SeverityControlsProps {
  severity?: "critical" | "warning" | "all";
}

const severityOptions: { label: string; value: SeverityControlsProps["severity"] }[] = [
  { label: "Tutti", value: "all" },
  { label: "Critici", value: "critical" },
  { label: "Warning", value: "warning" },
];

export function SeverityControls({ severity = "all" }: SeverityControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (value?: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (!value || value === "all") {
      params.delete("severity");
    } else {
      params.set("severity", value);
    }
    router.push(params.toString() ? `${pathname}?${params}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-border/80 bg-card px-2 py-1 text-sm text-muted-foreground">
      {severityOptions.map((option) => {
        const isActive = option.value === severity || (!severity && option.value === "all");
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => update(option.value ?? undefined)}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              isActive ? "bg-primary/15 text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
