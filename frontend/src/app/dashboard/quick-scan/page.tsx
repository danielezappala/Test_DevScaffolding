"use client";

import * as React from "react";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { inventoryApi, ApiClientError } from "@/lib/api";
import type { Wine, MovementType } from "@/types";
import { cn } from "@/lib/utils";

type ScanState = "idle" | "loading" | "success" | "error";

export default function QuickScanPage(): JSX.Element {
  const [scanState, setScanState] = React.useState<ScanState>("idle");
  const [wine, setWine] = React.useState<Wine | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [lastBarcode, setLastBarcode] = React.useState<string>("");
  const [isProcessingMovement, setIsProcessingMovement] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Handle barcode scan
  const handleScan = async (barcode: string) => {
    // Clear previous state
    setError(null);
    setSuccessMessage(null);
    setWine(null);
    setScanState("loading");
    setLastBarcode(barcode);

    try {
      // Call API to search wine by barcode (Requirement 2.1)
      const foundWine = await inventoryApi.getWineByBarcode(barcode);
      
      // Handle success state (Requirement 2.2)
      setWine(foundWine);
      setScanState("success");
    } catch (err) {
      // Handle error states (Requirements 2.3, 9.1, 9.2, 9.3)
      setScanState("error");
      
      if (err instanceof ApiClientError) {
        if (err.status === 404) {
          setError(`Barcode ${barcode} non trovato nel database`);
        } else if (err.status === 400) {
          setError("Formato barcode non valido");
        } else if (err.status === 500) {
          setError("Errore del server. Riprova più tardi.");
        } else {
          setError("Errore durante la ricerca del vino");
        }
      } else {
        setError("Errore di connessione. Verifica la tua connessione internet.");
      }
    }
  };

  // Handle quick action (carico/scarico)
  const handleQuickAction = async (type: MovementType) => {
    if (!wine || !lastBarcode) return;

    setIsProcessingMovement(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Create movement by barcode (Requirement 3.1)
      await inventoryApi.createMovementByBarcode({
        barcode: lastBarcode,
        type,
        quantity: 1,
        unit: "bottle",
      });

      // Refresh wine data to show updated quantity
      const updatedWine = await inventoryApi.getWineByBarcode(lastBarcode);
      setWine(updatedWine);

      // Show success message
      const actionLabel = type === "in" ? "Carico" : "Scarico";
      setSuccessMessage(`${actionLabel} di 1 bottiglia registrato con successo!`);

      // Reset state after operation (Requirement 6.4)
      setTimeout(() => {
        setWine(null);
        setScanState("idle");
        setSuccessMessage(null);
        setLastBarcode("");
      }, 2000);
    } catch (err) {
      // Handle error
      if (err instanceof ApiClientError) {
        if (err.status === 400) {
          const errorBody = err.body as { detail?: string };
          setError(errorBody?.detail || "Stock insufficiente per lo scarico");
        } else {
          setError("Errore durante la creazione del movimento");
        }
      } else {
        setError("Errore di connessione");
      }
    } finally {
      setIsProcessingMovement(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setScanState("idle");
    setWine(null);
    setLastBarcode("");
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header - Hidden on mobile when camera is active for fullscreen experience */}
      <div className={cn(
        "border-b border-border bg-card px-4 py-4 sm:py-6 md:px-8 lg:px-10",
        "md:block" // Always show on tablet/desktop
      )}>
        <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
          Quick Scan
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
          Scansiona un barcode per visualizzare il vino e registrare rapidamente carichi o scarichi
        </p>
      </div>

      {/* Main content - Responsive layouts */}
      <div className="px-4 py-4 sm:py-6 md:px-8 lg:px-10">
        {/* Desktop Layout (lg+): Horizontal layout with scanner on left, results on right */}
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Left column: Scanner (Desktop/Tablet) or Full width (Mobile) */}
            <div className="space-y-4 sm:space-y-6">
              {/* Scanner component */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:rounded-2xl sm:p-6">
                <BarcodeScanner
                  onScan={handleScan}
                  mode="camera"
                  disabled={scanState === "loading" || isProcessingMovement}
                  placeholder="Scansiona o inserisci barcode..."
                />
              </div>

              {/* Loading state - Show in scanner column on desktop */}
              {scanState === "loading" && (
                <div className="rounded-xl border border-border bg-card p-6 text-center sm:rounded-2xl sm:p-8 lg:hidden">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent sm:h-12 sm:w-12"></div>
                  <p className="mt-3 text-xs text-muted-foreground sm:mt-4 sm:text-sm">
                    Ricerca in corso...
                  </p>
                </div>
              )}

              {/* Success message - Mobile/Tablet */}
              {successMessage && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 sm:rounded-2xl sm:p-6 lg:hidden">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">✓</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800 sm:text-base">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error state - Mobile/Tablet */}
              {scanState === "error" && error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 sm:rounded-2xl sm:p-6 lg:hidden">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800 sm:text-base">Errore</p>
                      <p className="mt-1 text-xs text-red-700 sm:text-sm">{error}</p>
                      <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:gap-3">
                        <button
                          onClick={handleRetry}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                        >
                          Riprova
                        </button>
                        <button
                          onClick={() => {
                            /* TODO: Implement manual search */
                          }}
                          className="rounded-lg border-2 border-red-600 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Ricerca manuale
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Results (Desktop only - horizontal layout) */}
            <div className="hidden space-y-4 lg:block lg:space-y-6">
              {/* Loading state - Desktop */}
              {scanState === "loading" && (
                <div className="rounded-2xl border border-border bg-card p-8 text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Ricerca in corso...
                  </p>
                </div>
              )}

              {/* Success message - Desktop */}
              {successMessage && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error state - Desktop */}
              {scanState === "error" && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <p className="font-semibold text-red-800">Errore</p>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={handleRetry}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                        >
                          Riprova
                        </button>
                        <button
                          onClick={() => {
                            /* TODO: Implement manual search */
                          }}
                          className="rounded-lg border-2 border-red-600 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Ricerca manuale
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wine details and actions - Desktop horizontal layout */}
              {scanState === "success" && wine && !successMessage && (
                <DesktopWineDetails
                  wine={wine}
                  isProcessingMovement={isProcessingMovement}
                  onQuickAction={handleQuickAction}
                />
              )}
            </div>
          </div>

          {/* Wine details and actions - Mobile/Tablet (vertical stacked layout) */}
          {scanState === "success" && wine && !successMessage && (
            <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6 lg:hidden">
              <MobileTabletWineDetails
                wine={wine}
                isProcessingMovement={isProcessingMovement}
                onQuickAction={handleQuickAction}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Desktop Wine Details Component - Horizontal optimized layout
interface WineDetailsProps {
  wine: Wine;
  isProcessingMovement: boolean;
  onQuickAction: (type: MovementType) => void;
}

function DesktopWineDetails({ wine, isProcessingMovement, onQuickAction }: WineDetailsProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Wine details card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {wine.name}
            </h2>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-semibold">Annata:</span> {wine.vintage}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-semibold">Tipo:</span>{" "}
                {wine.type_label?.it || wine.type}
              </span>
              {wine.denomination && (
                <span className="flex items-center gap-1">
                  <span className="font-semibold">Denominazione:</span>{" "}
                  {wine.denomination}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stock quantity */}
        <div className="mt-6 rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-muted-foreground">
              Quantità disponibile
            </span>
            <span className="text-3xl font-bold text-foreground">
              {wine.quantity} bottiglie
            </span>
          </div>
          
          {/* Threshold warning */}
          {wine.threshold && wine.quantity < wine.threshold && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              <span>⚠️</span>
              <span>
                Stock sotto soglia (soglia: {wine.threshold} bottiglie)
              </span>
            </div>
          )}
          
          {wine.quantity === 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              <span>🚫</span>
              <span>Stock esaurito</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick action buttons - Desktop horizontal */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onQuickAction("in")}
          disabled={isProcessingMovement}
          className={cn(
            "flex items-center justify-center gap-3 rounded-2xl border-2 px-6 py-6 text-lg font-bold shadow-sm transition",
            "border-earth-teal bg-earth-teal text-white hover:bg-earth-teal/90",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span className="text-2xl">📥</span>
          <span>Carico (+1)</span>
        </button>

        <button
          onClick={() => onQuickAction("out")}
          disabled={isProcessingMovement || wine.quantity === 0}
          className={cn(
            "flex items-center justify-center gap-3 rounded-2xl border-2 px-6 py-6 text-lg font-bold shadow-sm transition",
            "border-earth-brick bg-earth-brick text-white hover:bg-earth-brick/90",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span className="text-2xl">📤</span>
          <span>Scarico (-1)</span>
        </button>
      </div>

      {/* Processing indicator */}
      {isProcessingMovement && (
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Registrazione movimento in corso...
          </p>
        </div>
      )}
    </div>
  );
}

// Mobile/Tablet Wine Details Component - Vertical stacked layout with large touch targets
function MobileTabletWineDetails({ wine, isProcessingMovement, onQuickAction }: WineDetailsProps): JSX.Element {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Wine details card - Compact for mobile */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
              {wine.name}
            </h2>
            <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground sm:mt-3 sm:flex-row sm:flex-wrap sm:gap-3 sm:text-sm">
              <span className="flex items-center gap-1">
                <span className="font-semibold">Annata:</span> {wine.vintage}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-semibold">Tipo:</span>{" "}
                {wine.type_label?.it || wine.type}
              </span>
              {wine.denomination && (
                <span className="flex items-center gap-1">
                  <span className="font-semibold">Denominazione:</span>{" "}
                  {wine.denomination}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stock quantity - Prominent display */}
        <div className="mt-4 rounded-lg border border-border bg-background p-4 sm:mt-6 sm:rounded-xl sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground sm:text-sm">
              Quantità disponibile
            </span>
            <span className="text-xl font-bold text-foreground sm:text-2xl">
              {wine.quantity} bottiglie
            </span>
          </div>
          
          {/* Threshold warning */}
          {wine.threshold && wine.quantity < wine.threshold && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-800 sm:mt-3 sm:text-sm">
              <span>⚠️</span>
              <span>
                Stock sotto soglia (soglia: {wine.threshold} bottiglie)
              </span>
            </div>
          )}
          
          {wine.quantity === 0 && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800 sm:mt-3 sm:text-sm">
              <span>🚫</span>
              <span>Stock esaurito</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick action buttons - Large touch targets for mobile, two-column for tablet */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <button
          onClick={() => onQuickAction("in")}
          disabled={isProcessingMovement}
          className={cn(
            "flex items-center justify-center gap-3 rounded-xl border-2 px-6 py-5 text-base font-bold shadow-sm transition",
            "sm:rounded-2xl sm:py-6 sm:text-lg",
            "border-earth-teal bg-earth-teal text-white hover:bg-earth-teal/90 active:bg-earth-teal/80",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "touch-manipulation" // Optimize for touch
          )}
        >
          <span className="text-2xl">📥</span>
          <span>Carico (+1)</span>
        </button>

        <button
          onClick={() => onQuickAction("out")}
          disabled={isProcessingMovement || wine.quantity === 0}
          className={cn(
            "flex items-center justify-center gap-3 rounded-xl border-2 px-6 py-5 text-base font-bold shadow-sm transition",
            "sm:rounded-2xl sm:py-6 sm:text-lg",
            "border-earth-brick bg-earth-brick text-white hover:bg-earth-brick/90 active:bg-earth-brick/80",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "touch-manipulation" // Optimize for touch
          )}
        >
          <span className="text-2xl">📤</span>
          <span>Scarico (-1)</span>
        </button>
      </div>

      {/* Processing indicator */}
      {isProcessingMovement && (
        <div className="rounded-xl border border-border bg-card p-4 text-center sm:rounded-2xl">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Registrazione movimento in corso...
          </p>
        </div>
      )}
    </div>
  );
}
