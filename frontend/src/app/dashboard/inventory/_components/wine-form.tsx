"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApiClientError, inventoryApi } from "@/lib/api";
import type { Supplier, Wine, WineType } from "@/types";
import { FormInput, FormSelect, FormTextArea } from "@/components/form-input";
import { cn } from "@/lib/utils";
import { wineTypeLabels } from "@/lib/wine-utils";
import { Button } from "@/components/button";

const wineTypeOptions = (Object.keys(wineTypeLabels) as WineType[]).map((key) => ({
  label: wineTypeLabels[key],
  value: key,
}));

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
    bottles_per_package: initialData?.bottles_per_package?.toString() ?? "6",
    barcode: initialData?.barcode ?? "",
    producer_id: initialData?.producer_id?.toString() ?? "",
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
          bottles_per_package: Number(formData.bottles_per_package) || 1,
          barcode: formData.barcode || undefined,
          producer_id: formData.producer_id ? Number(formData.producer_id) : undefined,
          notes: formData.notes || undefined,
        };

        console.log("Payload being sent:", JSON.stringify(payload, null, 2));

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
        console.error("Error saving wine:", error);
        
        // Extract error message from API response
        let errorMessage = "Impossibile salvare il vino. Controlla i campi o riprova.";
        
        // Check if it's an ApiClientError with body
        if (error instanceof ApiClientError) {
          const body = error.body;
          if (body && typeof body === "object" && "detail" in body) {
            const detail = (body as { detail?: string }).detail;
            if (detail) {
              errorMessage = detail;
            }
          }
        }
        
        setStatus({ type: "error", message: errorMessage });
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

      <div className="grid gap-4 md:grid-cols-3">
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
          id="bottles_per_package"
          name="bottles_per_package"
          label="Bottiglie per collo"
          type="number"
          min="1"
          value={formData.bottles_per_package}
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
          id="producer_id"
          name="producer_id"
          label="Produttore"
          value={formData.producer_id}
          onChange={handleChange}
          options={suppliers.map((supplier) => ({ label: supplier.name, value: supplier.id }))}
          placeholder="Seleziona produttore"
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
        <Button
          type="submit"
          disabled={isPending}
          variant="primary"
        >
          {isPending ? "Salvataggio..." : "Salva vino"}
        </Button>
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
