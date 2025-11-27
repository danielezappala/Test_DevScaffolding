"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface InventoryPaginationControlsProps {
  page: number;
  hasNext: boolean;
}

export function InventoryPaginationControls({ page, hasNext }: InventoryPaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigateTo = (nextPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      <span>
        Pagina {page} {hasNext ? "" : "(ultimo blocco)"}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-border px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground transition disabled:opacity-50"
          onClick={() => navigateTo(page - 1)}
          disabled={page <= 1}
        >
          Prec
        </button>
        <button
          type="button"
          className="rounded-full border border-border px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground transition disabled:opacity-50"
          onClick={() => navigateTo(page + 1)}
          disabled={!hasNext}
        >
          Succ
        </button>
      </div>
    </div>
  );
}
