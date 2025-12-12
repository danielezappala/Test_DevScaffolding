"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { inventoryApi } from "@/lib/api";
import type { Supplier } from "@/types";
import { FormInput, FormTextArea } from "@/components/form-input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";

interface SupplierFormProps {
  initialData?: Supplier;
  supplierId?: number;
  mode: "create" | "edit";
}

export function SupplierForm({ initialData, supplierId, mode }: SupplierFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [status, setStatus] = React.useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });

  const initialFormData = React.useMemo(() => ({
    name: initialData?.name ?? "",
    category: initialData?.category ?? "BOTH",
    contact_email: initialData?.contact_email ?? "",
    phone: initialData?.phone ?? "",
    address: initialData?.address ?? "",
    vat_number: initialData?.vat_number ?? "",
    notes: initialData?.notes ?? "",
  }), [initialData]);

  const [formData, setFormData] = React.useState(initialFormData);
  
  // Gestione checkbox per categoria
  const [isProducer, setIsProducer] = React.useState(
    initialData?.category === "PRODUCER" || initialData?.category === "BOTH"
  );
  const [isDistributor, setIsDistributor] = React.useState(
    initialData?.category === "DISTRIBUTOR" || initialData?.category === "BOTH"
  );
  
  // Aggiorna category quando cambiano i checkbox
  React.useEffect(() => {
    let category: "PRODUCER" | "DISTRIBUTOR" | "BOTH";
    if (isProducer && isDistributor) {
      category = "BOTH";
    } else if (isProducer) {
      category = "PRODUCER";
    } else if (isDistributor) {
      category = "DISTRIBUTOR";
    } else {
      category = "BOTH"; // Default se nessuno selezionato
    }
    setFormData((prev) => ({ ...prev, category }));
  }, [isProducer, isDistributor]);

  // Rileva se ci sono modifiche
  const hasChanges = React.useMemo(() => {
    return Object.keys(formData).some(
      (key) => formData[key as keyof typeof formData] !== initialFormData[key as keyof typeof initialFormData]
    );
  }, [formData, initialFormData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus({ type: "idle" }); // Reset status on change
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const payload = {
          name: formData.name,
          category: formData.category,
          contact_email: formData.contact_email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          vat_number: formData.vat_number || undefined,
          notes: formData.notes || undefined,
        };

        if (mode === "create") {
          await inventoryApi.createSupplier(payload);
          setStatus({ type: "success", message: "Fornitore creato." });
          setFormData({
            name: "",
            category: "BOTH",
            contact_email: "",
            phone: "",
            address: "",
            vat_number: "",
            notes: "",
          });
          setIsProducer(true);
          setIsDistributor(true);
        } else if (mode === "edit" && supplierId) {
          await inventoryApi.updateSupplier(supplierId, payload);
          setStatus({ type: "success", message: "Fornitore aggiornato." });
        }

        router.refresh();
      } catch (error) {
        console.error(error);
        setStatus({ type: "error", message: "Errore nel salvataggio del fornitore." });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput id="name" name="name" label="Nome" required value={formData.name} onChange={handleChange} placeholder="Cantina, distributore…" />
        <FormInput id="contact_email" name="contact_email" label="Email" type="email" value={formData.contact_email} onChange={handleChange} />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">Categoria</label>
        <p className="text-xs text-muted-foreground">Seleziona una o entrambe le categorie</p>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isProducer}
              onChange={(e) => setIsProducer(e.target.checked)}
              className="h-4 w-4 rounded border-gray-400 text-primary"
            />
            <span className="text-sm text-foreground">Produttore</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDistributor}
              onChange={(e) => setIsDistributor(e.target.checked)}
              className="h-4 w-4 rounded border-gray-400 text-primary"
            />
            <span className="text-sm text-foreground">Distributore</span>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormInput id="phone" name="phone" label="Telefono" value={formData.phone} onChange={handleChange} />
        <FormInput id="vat_number" name="vat_number" label="P. IVA" value={formData.vat_number} onChange={handleChange} />
      </div>

      <FormInput id="address" name="address" label="Indirizzo" value={formData.address} onChange={handleChange} />

      <FormTextArea id="notes" name="notes" label="Note" value={formData.notes} onChange={handleChange} placeholder="Condizioni di pagamento, preferenze…" />

      {status.type !== "idle" && (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            status.type === "success" ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-destructive/40 bg-destructive/10 text-destructive"
          )}
        >
          {status.message}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={isPending || !hasChanges || !formData.name.trim()}
          variant="primary"
        >
          {isPending ? "Salvataggio..." : "Salva"}
        </Button>
        <button type="button" onClick={() => router.back()} className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline">
          Annulla
        </button>
      </div>
    </form>
  );
}
