import { serverInventoryApi } from "@/lib/server-api";
import { WineForm } from "../_components/wine-form";

export default async function NewWinePage() {
  const suppliers = await serverInventoryApi.listSuppliers();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Inventario</p>
        <h1 className="font-display text-3xl text-foreground">Aggiungi nuovo vino</h1>
      </header>
      <WineForm suppliers={suppliers} mode="create" />
    </div>
  );
}
