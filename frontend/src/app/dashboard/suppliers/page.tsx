import { Plus } from "lucide-react";
import { serverInventoryApi } from "@/lib/server-api";
import { SuppliersTable } from "./suppliers-table";
import { Button } from "@/components/button";

export default async function SuppliersPage() {
  const suppliers = await serverInventoryApi.listSuppliers();

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-4 py-6 shadow-sm sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Fornitori</p>
          <h1 className="font-display text-2xl text-foreground sm:text-3xl">Anagrafica partner</h1>
          <p className="text-sm text-muted-foreground">Gestisci cantine, distributori e contatti di riferimento.</p>
        </div>
        <Button href="/dashboard/suppliers/new" variant="primary">
          <Plus className="h-5 w-5" />
          Nuovo partner
        </Button>
      </header>

      <SuppliersTable suppliers={suppliers} />
    </div>
  );
}
