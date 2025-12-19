import { notFound } from "next/navigation";
import { ApiClientError } from "@/lib/api";
import { serverInventoryApi } from "@/lib/server-api";
import { WineForm } from "../../_components/wine-form";

interface PageProps {
  params: {
    wineId: string;
  };
}

export default async function EditWinePage({ params }: PageProps) {
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

  const suppliers = await serverInventoryApi.listSuppliers();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Inventario</p>
        <h1 className="font-display text-3xl text-foreground">Modifica {wine.name}</h1>
      </header>
      <WineForm suppliers={suppliers} initialData={wine} wineId={wine.id} mode="edit" />
    </div>
  );
}
