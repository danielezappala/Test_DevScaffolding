"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getDeviceType } from "@/lib/device-utils";
import { CameraScanner } from "./camera-scanner";

export type ScanMode = "auto" | "camera" | "manual";

export interface BarcodeScannerProps {
  /**
   * Callback fired when a barcode is successfully scanned
   */
  onScan: (barcode: string) => void;
  
  /**
   * Scanning mode: auto (device-based), camera, or manual
   * @default "auto"
   */
  mode?: ScanMode;
  
  /**
   * Whether to auto-focus the input field on mount
   * @default true
   */
  autoFocus?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Placeholder text for manual input
   */
  placeholder?: string;
  
  /**
   * Whether the scanner is disabled
   */
  disabled?: boolean;
}

export function BarcodeScanner({
  onScan,
  mode = "auto",
  autoFocus = true,
  className,
  placeholder = "Scan or enter barcode...",
  disabled = false,
}: BarcodeScannerProps): JSX.Element {
  const [activeMode, setActiveMode] = React.useState<"camera" | "manual">("manual");
  const [deviceType, setDeviceType] = React.useState<"mobile" | "tablet" | "desktop">("desktop");
  const [cameraError, setCameraError] = React.useState<Error | null>(null);

  // Detect device type on mount
  React.useEffect(() => {
    const detected = getDeviceType();
    setDeviceType(detected);

    // Determine active mode based on mode prop and device type
    if (mode === "auto") {
      // Auto mode: use camera for mobile/tablet, manual for desktop
      setActiveMode(detected === "desktop" ? "manual" : "camera");
    } else if (mode === "camera") {
      setActiveMode("camera");
    } else {
      setActiveMode("manual");
    }
  }, [mode]);

  // Handle mode switching (for mobile/tablet)
  const handleModeSwitch = (newMode: "camera" | "manual") => {
    setActiveMode(newMode);
    setCameraError(null); // Clear error when switching modes
  };

  // Handle camera errors - fallback to manual input
  const handleCameraError = (error: Error) => {
    console.error("Camera scanner error:", error);
    setCameraError(error);
    
    // Auto-fallback to manual input on camera error
    setActiveMode("manual");
  };

  return (
    <div className={cn("barcode-scanner", className)}>
      {/* Mode toggle for mobile/tablet */}
      {mode !== "manual" && (
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => handleModeSwitch("camera")}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition",
              activeMode === "camera"
                ? "bg-gray-600 text-white"
                : "border-2 border-gray-300 bg-white text-gray-600 hover:border-gray-400"
            )}
            disabled={disabled}
          >
            📷 Camera
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("manual")}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition",
              activeMode === "manual"
                ? "bg-gray-600 text-white"
                : "border-2 border-gray-300 bg-white text-gray-600 hover:border-gray-400"
            )}
            disabled={disabled}
          >
            ⌨️ Manual
          </button>
        </div>
      )}

      {/* Show camera error message if fallback occurred */}
      {cameraError && activeMode === "manual" && (
        <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">
                Camera unavailable
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {cameraError.message}. Using manual input instead.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Render appropriate scanner based on active mode */}
      {activeMode === "manual" ? (
        <ManualInput
          onScan={onScan}
          autoFocus={autoFocus}
          placeholder={placeholder}
          disabled={disabled}
          deviceType={deviceType}
        />
      ) : (
        <CameraScanner
          onDetected={onScan}
          onError={handleCameraError}
          active={!disabled}
          className="w-full"
        />
      )}
    </div>
  );
}

interface ManualInputProps {
  onScan: (barcode: string) => void;
  autoFocus: boolean;
  placeholder: string;
  disabled: boolean;
  deviceType: "mobile" | "tablet" | "desktop";
}

function ManualInput({
  onScan,
  autoFocus,
  placeholder,
  disabled,
  deviceType,
}: ManualInputProps): JSX.Element {
  const [barcode, setBarcode] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedBarcode = barcode.trim();
    if (trimmedBarcode) {
      onScan(trimmedBarcode);
      // Clear input and refocus after successful scan
      setBarcode("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle Enter key press for auto-submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="manual-input">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-base",
              "focus:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "placeholder:text-gray-400"
            )}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={disabled || !barcode.trim()}
            className={cn(
              "rounded-lg bg-gray-600 px-6 py-3 text-base font-semibold text-white shadow-md",
              "hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition"
            )}
          >
            Scan
          </button>
        </div>
      </form>

      {/* Desktop scanner hint */}
      {deviceType === "desktop" && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <p className="font-semibold">Hardware Scanner Tip</p>
              <p className="mt-1 text-blue-700">
                Using a USB or Bluetooth barcode scanner? Simply scan the barcode - it will automatically 
                fill the input field and submit. No need to click the button!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
