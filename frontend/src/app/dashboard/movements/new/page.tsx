"use client";
import { inventoryApi } from "@/lib/api";
import { MovementForm } from "../_components/movement-form";

export default async function NewMovementPage() {
  const wines = await inventoryApi.listWines({ limit: 200 });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Movimenti</p>
        <h1 className="font-display text-3xl text-foreground">Registra movimento</h1>
      </header>
      <MovementForm wines={wines} />
    </div>
  );
}
