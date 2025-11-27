"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { inventoryApi } from "@/lib/api";
import type { MovementType, Wine } from "@/types";
import { FormInput, FormSelect, FormTextArea } from "@/components/form-input";
import { cn } from "@/lib/utils";

interface MovementFormProps {
  wines: Wine[];
}

export function MovementForm({ wines }: MovementFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [status, setStatus] = React.useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });
  const [formData, setFormData] = React.useState({
    wine_id: "",
    type: "in" as MovementType,
    quantity: "0",
    lot_id: "",
    note: "",
    reference: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const payload = {
          wine_id: Number(formData.wine_id),
          type: formData.type,
          quantity: Number(formData.quantity),
          lot_id: formData.lot_id ? Number(formData.lot_id) : undefined,
          note: formData.note || undefined,
          reference: formData.reference || undefined,
        };
        await inventoryApi.createMovement(payload);
        setStatus({ type: "success", message: "Movimento registrato." });
        setFormData((prev) => ({ ...prev, quantity: "0", note: "", reference: "" }));
        router.refresh();
      } catch (error) {
        console.error(error);
        setStatus({ type: "error", message: "Errore nel registrare il movimento." });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <FormSelect
          id="wine_id"
          name="wine_id"
          label="Vino"
          required
          value={formData.wine_id}
          onChange={handleChange}
          options={wines.map((wine) => ({ label: `${wine.name} ${wine.vintage}`, value: wine.id }))}
          placeholder="Seleziona vino"
        />
        <FormSelect
          id="type"
          name="type"
          label="Tipo movimento"
          required
          value={formData.type}
          onChange={handleChange}
          options={[
            { label: "Carico", value: "in" },
            { label: "Scarico", value: "out" },
            { label: "Aggiustamento", value: "adjust" },
          ]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormInput
          id="quantity"
          name="quantity"
          label="Quantità"
          type="number"
          min="1"
          required
          value={formData.quantity}
          onChange={handleChange}
        />
        <FormInput
          id="reference"
          name="reference"
          label="Riferimento"
          value={formData.reference}
          onChange={handleChange}
          placeholder="Ordine, documento..."
        />
        <FormInput
          id="lot_id"
          name="lot_id"
          label="Lot ID (per scarico)"
          value={formData.lot_id}
          onChange={handleChange}
          placeholder="Opzionale"
        />
      </div>

      <FormTextArea id="note" name="note" label="Note" value={formData.note} onChange={handleChange} placeholder="Dettagli sul movimento" />

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
          {isPending ? "Registrazione..." : "Registra movimento"}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline">
          Annulla
        </button>
      </div>
    </form>
  );
}
