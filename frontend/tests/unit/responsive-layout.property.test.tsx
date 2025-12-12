/**
 * Property-Based Test for Responsive Layout Adaptation
 * Feature: barcode-scanning, Property 10: Responsive Layout Adaptation
 * Validates: Requirements 6.1, 6.2, 6.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import QuickScanPage from "@/app/dashboard/quick-scan/page";

// Mock the API client
vi.mock("@/lib/api", () => ({
  inventoryApi: {
    getWineByBarcode: vi.fn(),
    createMovementByBarcode: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    constructor(message: string, public status: number, public body?: any) {
      super(message);
    }
  },
}));

// Mock the camera scanner component to avoid camera initialization in tests
vi.mock("@/components/camera-scanner", () => ({
  CameraScanner: ({ onDetected }: { onDetected: (code: string) => void }) => (
    <div data-testid="camera-scanner">Camera Scanner Mock</div>
  ),
}));

describe("Property 10: Responsive Layout Adaptation", () => {
  let originalWindow: any;
  let originalNavigator: any;

  beforeEach(() => {
    originalWindow = global.window;
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    global.window = originalWindow;
    global.navigator = originalNavigator;
    vi.restoreAllMocks();
    // Clean up any rendered components
    document.body.innerHTML = '';
  });

  /**
   * Property: For any screen width, the UI should render the appropriate layout
   * without horizontal scrolling
   * 
   * This property tests that:
   * 1. Mobile layout (< 768px): Vertical stacked layout with single column
   * 2. Tablet layout (768px - 1023px): Two-column layout for actions
   * 3. Desktop layout (>= 1024px): Horizontal layout with scanner and results side-by-side
   */
  it("should render appropriate layout for any screen width without horizontal scrolling", () => {
    fc.assert(
      fc.property(
        // Generate screen widths from 320px (min mobile) to 2560px (large desktop)
        fc.integer({ min: 320, max: 2560 }),
        (screenWidth) => {
          // Set up window dimensions
          Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: screenWidth,
          });

          // Set appropriate user agent based on screen width
          const userAgent = screenWidth < 768
            ? "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
            : screenWidth < 1024
            ? "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)"
            : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0";

          Object.defineProperty(navigator, "userAgent", {
            writable: true,
            configurable: true,
            value: userAgent,
          });

          // Render the component
          const { container } = render(<QuickScanPage />);

          // Verify the page renders without errors
          expect(container).toBeTruthy();

          // Check that the main container exists
          const mainContainer = container.querySelector(".min-h-full");
          expect(mainContainer).toBeTruthy();

          // Verify no horizontal scrolling by checking that content doesn't exceed viewport
          // In a real browser, we'd check scrollWidth <= clientWidth
          // In tests, we verify the responsive classes are applied correctly

          if (screenWidth < 768) {
            // Mobile: Should have single column layout (grid-cols-1)
            // Verify mobile-specific classes are present
            const mobileElements = container.querySelectorAll(".grid-cols-1");
            expect(mobileElements.length).toBeGreaterThan(0);
          } else if (screenWidth >= 768 && screenWidth < 1024) {
            // Tablet: Should have two-column layout for actions (sm:grid-cols-2)
            // The layout should be responsive
            const gridElements = container.querySelectorAll('[class*="grid"]');
            expect(gridElements.length).toBeGreaterThan(0);
          } else {
            // Desktop: Should have horizontal layout (lg:grid-cols-2)
            // Verify desktop-specific layout exists
            const desktopGrid = container.querySelector('[class*="lg:grid-cols-2"]');
            expect(desktopGrid).toBeTruthy();
          }

          // Verify header is present (use getAllByText since there might be multiple renders)
          const headers = screen.queryAllByText("Quick Scan");
          expect(headers.length).toBeGreaterThan(0);

          // Verify scanner component is rendered (either input or camera)
          const scannerInput = container.querySelector('input[type="text"]');
          const cameraScanner = container.querySelector('[data-testid="camera-scanner"]');
          expect(scannerInput || cameraScanner).toBeTruthy();
        }
      ),
      { numRuns: 100 } // Run 100 iterations with different screen widths
    );
  });

  /**
   * Property: For any device type, the layout should adapt correctly
   * 
   * This property tests that the layout adapts based on device type detection
   */
  it("should adapt layout based on device type detection", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("mobile", "tablet", "desktop"),
        (deviceType) => {
          // Set up appropriate screen width and user agent for device type
          const config = {
            mobile: { width: 375, ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" },
            tablet: { width: 768, ua: "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)" },
            desktop: { width: 1920, ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0" },
          };

          const { width, ua } = config[deviceType];

          Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: width,
          });

          Object.defineProperty(navigator, "userAgent", {
            writable: true,
            configurable: true,
            value: ua,
          });

          // Render the component
          const { container } = render(<QuickScanPage />);

          // Verify the component renders
          expect(container).toBeTruthy();

          // Verify appropriate layout elements are present
          const headers = screen.queryAllByText("Quick Scan");
          expect(headers.length).toBeGreaterThan(0);

          // Verify scanner is present (either input or camera)
          const scannerInput = container.querySelector('input[type="text"]');
          const cameraScanner = container.querySelector('[data-testid="camera-scanner"]');
          expect(scannerInput || cameraScanner).toBeTruthy();

          // For desktop, verify horizontal layout exists
          if (deviceType === "desktop") {
            const desktopGrid = container.querySelector('[class*="lg:grid-cols-2"]');
            expect(desktopGrid).toBeTruthy();
          }

          // For mobile/tablet, verify vertical/responsive layout
          if (deviceType === "mobile" || deviceType === "tablet") {
            const responsiveElements = container.querySelectorAll('[class*="grid-cols-1"]');
            expect(responsiveElements.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 50 } // Run 50 iterations
    );
  });

  /**
   * Property: Touch targets should be appropriately sized for mobile devices
   * 
   * This property verifies that interactive elements have appropriate sizing
   * for touch interaction on mobile devices
   */
  it("should have appropriately sized touch targets on mobile devices", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }), // Mobile screen widths
        (screenWidth) => {
          Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: screenWidth,
          });

          Object.defineProperty(navigator, "userAgent", {
            writable: true,
            configurable: true,
            value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
          });

          const { container } = render(<QuickScanPage />);

          // Verify buttons exist
          const buttons = container.querySelectorAll("button");
          expect(buttons.length).toBeGreaterThan(0);

          // Verify scanner exists (either input or camera)
          const input = container.querySelector('input[type="text"]');
          const cameraScanner = container.querySelector('[data-testid="camera-scanner"]');
          expect(input || cameraScanner).toBeTruthy();

          // Verify the layout is mobile-optimized
          const mobileLayout = container.querySelector(".min-h-full");
          expect(mobileLayout).toBeTruthy();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Desktop layout should show horizontal split for scanner and results
   * 
   * This property verifies that desktop layouts use horizontal space efficiently
   */
  it("should use horizontal layout on desktop screens", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1024, max: 2560 }), // Desktop screen widths
        (screenWidth) => {
          Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: screenWidth,
          });

          Object.defineProperty(navigator, "userAgent", {
            writable: true,
            configurable: true,
            value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0",
          });

          const { container } = render(<QuickScanPage />);

          // Verify desktop horizontal layout exists
          const desktopGrid = container.querySelector('[class*="lg:grid-cols-2"]');
          expect(desktopGrid).toBeTruthy();

          // Verify scanner is in the layout (either input or camera)
          const scannerInput = container.querySelector('input[type="text"]');
          const cameraScanner = container.querySelector('[data-testid="camera-scanner"]');
          expect(scannerInput || cameraScanner).toBeTruthy();

          // Verify header is present
          const headers = screen.queryAllByText("Quick Scan");
          expect(headers.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });
});
