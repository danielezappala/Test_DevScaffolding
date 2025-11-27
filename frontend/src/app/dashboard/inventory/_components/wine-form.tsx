"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { inventoryApi } from "@/lib/api";
import type { Supplier, Wine } from "@/types";
import { FormInput, FormSelect, FormTextArea } from "@/components/form-input";
import { cn } from "@/lib/utils";

const wineTypeOptions = [
  { label: "Rosso", value: "red" },
  { label: "Bianco", value: "white" },
  { label: "Rosato", value: "rose" },
  { label: "Spumante", value: "sparkling" },
  { label: "Dessert", value: "dessert" },
  { label: "Altro", value: "other" },
];

interface WineFormProps {
  suppliers: Supplier[];
  initialData?: Partial<Wine>;
  wineId?: number;
  mode: "create" | "edit";
}

export function WineForm({ suppliers, initialData, wineId, mode }: WineFormProps) {
  const router = useRouter();
  const [status, setStatus] = React.useState<{ type: "idle" | "success" | "error"; message?: string }>({
    type: "idle",
  });
  const [isPending, startTransition] = React.useTransition();

  const [formData, setFormData] = React.useState({
    name: initialData?.name ?? "",
    vintage: initialData?.vintage?.toString() ?? "",
    type: initialData?.type ?? "red",
    denomination: initialData?.denomination ?? "",
    price: initialData?.price ? Number(initialData.price).toString() : "",
    quantity: initialData?.quantity?.toString() ?? "0",
    threshold: initialData?.threshold?.toString() ?? "10",
    barcode: initialData?.barcode ?? "",
    supplier_id: initialData?.supplier_id?.toString() ?? "",
    notes: initialData?.notes ?? "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const payload = {
          name: formData.name,
          vintage: Number(formData.vintage),
          type: formData.type,
          denomination: formData.denomination || undefined,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          threshold: formData.threshold ? Number(formData.threshold) : undefined,
          barcode: formData.barcode || undefined,
          supplier_id: formData.supplier_id ? Number(formData.supplier_id) : undefined,
          notes: formData.notes || undefined,
        };

        if (mode === "create") {
          await inventoryApi.createWine(payload);
          setStatus({ type: "success", message: "Vino creato con successo." });
          setFormData((prev) => ({ ...prev, name: "", vintage: "", price: "", barcode: "", notes: "" }));
        } else if (mode === "edit" && wineId) {
          await inventoryApi.updateWine(wineId, payload);
          setStatus({ type: "success", message: "Vino aggiornato con successo." });
        }

        router.refresh();
      } catch (error) {
        console.error(error);
        setStatus({ type: "error", message: "Impossibile salvare il vino. Controlla i campi o riprova." });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-3">
        <h2 className="font-display text-2xl text-foreground">{mode === "create" ? "Nuovo vino" : "Modifica vino"}</h2>
        <p className="text-sm text-muted-foreground">
          Completa i campi chiave per l&apos;anagrafica vino. Palette calda e controlli con validazione inline.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormInput id="name" name="name" label="Nome vino" required value={formData.name} onChange={handleChange} placeholder="Es. Etna Rosso DOC" />
        <FormInput
          id="vintage"
          name="vintage"
          label="Annata"
          type="number"
          required
          value={formData.vintage}
          onChange={handleChange}
          placeholder="2020"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormSelect
          id="type"
          name="type"
          label="Tipologia"
          required
          value={formData.type}
          onChange={handleChange}
          options={wineTypeOptions}
          placeholder="Seleziona"
        />
        <FormInput
          id="denomination"
          name="denomination"
          label="Denominazione"
          value={formData.denomination}
          onChange={handleChange}
          placeholder="DOC, DOCG…"
        />
        <FormInput
          id="price"
          name="price"
          label="Prezzo unitario (€)"
          type="number"
          min="0"
          step="0.01"
          required
          value={formData.price}
          onChange={handleChange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormInput
          id="quantity"
          name="quantity"
          label="Quantità disponibile"
          type="number"
          min="0"
          required
          value={formData.quantity}
          onChange={handleChange}
        />
        <FormInput
          id="threshold"
          name="threshold"
          label="Soglia minima"
          type="number"
          min="0"
          value={formData.threshold}
          onChange={handleChange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormInput id="barcode" name="barcode" label="Barcode" value={formData.barcode} onChange={handleChange} placeholder="Codice opzionale" />
        <FormSelect
          id="supplier_id"
          name="supplier_id"
          label="Fornitore"
          value={formData.supplier_id}
          onChange={handleChange}
          options={suppliers.map((supplier) => ({ label: supplier.name, value: supplier.id }))}
          placeholder="Seleziona fornitore"
        />
      </div>

      <FormTextArea
        id="notes"
        name="notes"
        label="Dettagli e note"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Es. Lotti speciali, condizioni di conservazione…"
      />

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
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full border border-primary/70 bg-primary/15 px-6 py-2 text-sm font-semibold text-primary-foreground transition hover:border-primary hover:bg-primary/25 disabled:opacity-50"
        >
          {isPending ? "Salvataggio..." : "Salva vino"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}
