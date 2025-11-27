"use client";
import { notFound } from "next/navigation";
import { inventoryApi, ApiClientError } from "@/lib/api";
import { SupplierForm } from "../../_components/supplier-form";

interface PageProps {
  params: {
    supplierId: string;
  };
}

export default async function EditSupplierPage({ params }: PageProps) {
  const supplierId = Number(params.supplierId);
  if (Number.isNaN(supplierId)) {
    notFound();
  }

  let supplier;
  try {
    const suppliers = await inventoryApi.listSuppliers();
    supplier = suppliers.find((record) => record.id === supplierId);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  if (!supplier) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Fornitori</p>
        <h1 className="font-display text-3xl text-foreground">Modifica fornitore</h1>
      </header>
      <SupplierForm mode="edit" initialData={supplier} supplierId={supplier.id} />
    </div>
  );
}
