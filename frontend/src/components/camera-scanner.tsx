"use client";

import * as React from "react";
import { loadQuagga } from "@/lib/quagga-loader";
import { vibrateOnScan } from "@/lib/haptic-feedback";
import { cn } from "@/lib/utils";

export interface CameraScannerProps {
  /**
   * Callback fired when a barcode is successfully detected
   */
  onDetected: (barcode: string) => void;
  
  /**
   * Callback fired when camera initialization fails
   */
  onError?: (error: Error) => void;
  
  /**
   * Whether the scanner is active
   */
  active?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function CameraScanner({
  onDetected,
  onError,
  active = true,
  className,
}: CameraScannerProps): JSX.Element {
  const scannerRef = React.useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const lastDetectedRef = React.useRef<string>("");
  const lastDetectedTimeRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (!active) {
      return;
    }

    let isSubscribed = true;

    const initializeScanner = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        // Load QuaggaJS dynamically
        const Quagga = await loadQuagga();

        if (!isSubscribed || !scannerRef.current) {
          return;
        }

        // Initialize QuaggaJS with camera stream
        await new Promise<void>((resolve, reject) => {
          Quagga.init(
            {
              inputStream: {
                type: "LiveStream",
                target: scannerRef.current!,
                constraints: {
                  width: { min: 640, ideal: 1280, max: 1920 },
                  height: { min: 480, ideal: 720, max: 1080 },
                  facingMode: "environment", // Use back camera on mobile
                  aspectRatio: { min: 1, max: 2 },
                },
              },
              locator: {
                patchSize: "medium",
                halfSample: true,
              },
              numOfWorkers: navigator.hardwareConcurrency || 4,
              decoder: {
                readers: [
                  "ean_reader", // EAN-13, EAN-8
                  "code_128_reader", // Code128
                ],
              },
              locate: true,
            },
            (err) => {
              if (err) {
                console.error("QuaggaJS initialization error:", err);
                reject(err);
                return;
              }
              resolve();
            }
          );
        });

        if (!isSubscribed) {
          return;
        }

        // Start scanning
        Quagga.start();

        // Handle barcode detection
        Quagga.onDetected((result) => {
          if (!result || !result.codeResult || !result.codeResult.code) {
            return;
          }

          const code = result.codeResult.code;
          const now = Date.now();

          // Debounce: prevent duplicate scans within 1 second
          if (
            code === lastDetectedRef.current &&
            now - lastDetectedTimeRef.current < 1000
          ) {
            return;
          }

          lastDetectedRef.current = code;
          lastDetectedTimeRef.current = now;

          // Provide haptic feedback on successful scan
          vibrateOnScan();

          // Call the onDetected callback
          onDetected(code);
        });

        setIsInitializing(false);
      } catch (err) {
        console.error("Camera scanner initialization failed:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize camera";
        setError(errorMessage);
        setIsInitializing(false);

        if (onError) {
          onError(
            err instanceof Error ? err : new Error("Camera initialization failed")
          );
        }
      }
    };

    initializeScanner();

    // Cleanup function
    return () => {
      isSubscribed = false;
      
      // Stop QuaggaJS
      loadQuagga()
        .then((Quagga) => {
          Quagga.stop();
        })
        .catch((err) => {
          console.error("Error stopping Quagga:", err);
        });
    };
  }, [active, onDetected, onError]);

  if (error) {
    const isPermissionError = 
      error.includes("permission") || 
      error.includes("Permission") ||
      error.includes("NotAllowedError") ||
      error.includes("denied");

    return (
      <div
        className={cn(
          "rounded-lg border-2 border-red-300 bg-red-50 p-6 text-center",
          className
        )}
      >
        <div className="text-4xl mb-3">❌</div>
        <p className="text-red-800 font-semibold mb-2">Camera Error</p>
        <p className="text-red-700 text-sm mb-4">{error}</p>
        
        {isPermissionError && (
          <div className="mt-4 text-left bg-white rounded-lg p-4 border border-red-200">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              To enable camera access:
            </p>
            <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
              <li>Open your browser settings</li>
              <li>Find &quot;Site Settings&quot; or &quot;Permissions&quot;</li>
              <li>Allow camera access for this site</li>
              <li>Reload the page</li>
            </ol>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("camera-scanner relative", className)}>
      {/* Camera viewport */}
      <div
        ref={scannerRef}
        className="relative overflow-hidden rounded-lg bg-black"
        style={{ minHeight: "400px" }}
      >
        {/* Loading overlay */}
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
            <div className="text-center text-white">
              <div className="text-4xl mb-3">📷</div>
              <p className="font-semibold">Initializing camera...</p>
            </div>
          </div>
        )}

        {/* Target overlay - visual feedback for scanning area */}
        {!isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative w-64 h-32">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
              
              {/* Scanning line animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="h-0.5 bg-green-400 shadow-lg shadow-green-400/50"
                  style={{
                    animation: "scan 2s ease-in-out infinite",
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Position the barcode within the frame</p>
        <p className="text-xs text-gray-500 mt-1">
          Detection happens automatically
        </p>
      </div>

      {/* CSS for scanning animation */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(128px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
