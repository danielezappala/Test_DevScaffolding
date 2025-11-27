"use client";
import Link from "next/link";
import { inventoryApi } from "@/lib/api";
import { DataTable } from "@/components/data-table";

export default async function SuppliersPage() {
  const suppliers = await inventoryApi.listSuppliers();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Fornitori</p>
          <h1 className="font-display text-3xl text-foreground">Anagrafica partner</h1>
          <p className="text-sm text-muted-foreground">Gestisci cantine, distributori e contatti di riferimento.</p>
        </div>
        <Link
          href="/test-devscaffolding/dashboard/suppliers/new"
          className="inline-flex items-center gap-2 rounded-full border border-primary/70 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:border-primary hover:bg-primary/25"
        >
          + Nuovo fornitore
        </Link>
      </header>

      <DataTable
        data={suppliers}
        columns={[
          { id: "name", header: "Nome", accessor: "name" },
          { id: "email", header: "Email", accessor: "contact_email" },
          { id: "phone", header: "Telefono", accessor: "phone" },
          { id: "vat", header: "P. IVA", accessor: "vat_number" },
          {
            id: "actions",
            header: "Azioni",
            render: (supplier) => (
              <Link
                href={`/test-devscaffolding/dashboard/suppliers/${supplier.id}/edit`}
                className="text-sm font-semibold text-primary-foreground underline-offset-4 hover:underline"
              >
                Modifica
              </Link>
            ),
          },
        ]}
        emptyState="Nessun fornitore registrato."
      />
    </div>
  );
}
