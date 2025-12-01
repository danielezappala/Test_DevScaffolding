"use client";
import { Suspense } from "react";
import InventoryPageContent from "./content";

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    }>
      <InventoryPageContent />
    </Suspense>
  );
}
