import { serverInventoryApi } from "@/lib/server-api";
import { MovementForm } from "../_components/movement-form";

type SearchParams = Record<string, string | string[] | undefined>;

function toStringValue(value?: string | string[]): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewMovementPage({ searchParams }: { searchParams?: SearchParams }) {
  const wines = await serverInventoryApi.listWines({ limit: 200 });
  const wineIdParam = toStringValue(searchParams?.wine_id);
  const preselectedWineId = wineIdParam ? Number(wineIdParam) : undefined;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Movimenti</p>
        <h1 className="font-display text-3xl text-foreground">Registra movimento</h1>
      </header>
      <MovementForm wines={wines} preselectedWineId={preselectedWineId} />
    </div>
  );
}
