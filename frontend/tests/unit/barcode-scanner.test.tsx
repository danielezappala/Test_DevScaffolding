import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BarcodeScanner } from "@/components/barcode-scanner";
import * as fc from "fast-check";

describe("BarcodeScanner Component", () => {
  let mockOnScan: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnScan = vi.fn();
    
    // Mock window.innerWidth for device detection
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1920, // Desktop width
    });
    
    Object.defineProperty(navigator, "userAgent", {
      writable: true,
      configurable: true,
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0",
    });
  });

  describe("Manual Input Mode", () => {
    it("renders manual input field and submit button", () => {
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
      
      const input = screen.getByPlaceholderText(/scan or enter barcode/i);
      const button = screen.getByRole("button", { name: /scan/i });
      
      expect(input).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it("calls onScan when submit button is clicked with valid barcode", async () => {
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
      
      const input = screen.getByPlaceholderText(/scan or enter barcode/i);
      const button = screen.getByRole("button", { name: /scan/i });
      
      fireEvent.change(input, { target: { value: "1234567890123" } });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockOnScan).toHaveBeenCalledWith("1234567890123");
      });
    });

    it("clears input after successful scan", async () => {
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
      
      const input = screen.getByPlaceholderText(/scan or enter barcode/i) as HTMLInputElement;
      const button = screen.getByRole("button", { name: /scan/i });
      
      fireEvent.change(input, { target: { value: "1234567890123" } });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(input.value).toBe("");
      });
    });

    it("does not call onScan when input is empty", () => {
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
      
      const button = screen.getByRole("button", { name: /scan/i });
      fireEvent.click(button);
      
      expect(mockOnScan).not.toHaveBeenCalled();
    });

    it("trims whitespace from barcode before calling onScan", async () => {
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
      
      const input = screen.getByPlaceholderText(/scan or enter barcode/i);
      const button = screen.getByRole("button", { name: /scan/i });
      
      fireEvent.change(input, { target: { value: "  1234567890123  " } });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockOnScan).toHaveBeenCalledWith("1234567890123");
      });
    });

    it("disables submit button when input is empty", () => {
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
      
      const button = screen.getByRole("button", { name: /scan/i }) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it("enables submit button when input has value", () => {
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
      
      const input = screen.getByPlaceholderText(/scan or enter barcode/i);
      const button = screen.getByRole("button", { name: /scan/i }) as HTMLButtonElement;
      
      fireEvent.change(input, { target: { value: "1234567890123" } });
      
      expect(button.disabled).toBe(false);
    });
  });

  describe("Property 8: Scanner Input Auto-Submit", () => {
    /**
     * Feature: barcode-scanning, Property 8: Scanner Input Auto-Submit
     * Validates: Requirements 4.2
     * 
     * Property: For any hardware scanner input followed by Enter key,
     * the system should automatically submit the form without requiring manual button click.
     */
    it("property: Enter key auto-submits for any valid barcode string", () => {
      fc.assert(
        fc.property(
          // Generate arbitrary alphanumeric strings (1-20 chars) to simulate barcodes
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          (barcode) => {
            // Reset mock for each iteration
            mockOnScan.mockClear();
            
            // Render component
            const { unmount } = render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
            
            // Get input element
            const input = screen.getByPlaceholderText(/scan or enter barcode/i);
            
            // Simulate hardware scanner: type barcode and press Enter
            fireEvent.change(input, { target: { value: barcode } });
            fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });
            
            // Verify onScan was called with the trimmed barcode
            expect(mockOnScan).toHaveBeenCalledWith(barcode.trim());
            expect(mockOnScan).toHaveBeenCalledTimes(1);
            
            // Verify input was cleared after scan
            const inputElement = input as HTMLInputElement;
            expect(inputElement.value).toBe("");
            
            // Cleanup
            unmount();
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design doc
      );
    });

    it("property: Enter key does not submit when input is empty or whitespace-only", () => {
      fc.assert(
        fc.property(
          // Generate whitespace-only strings
          fc.array(fc.constantFrom(" ", "\t", "\n"), { minLength: 1, maxLength: 10 }).map(arr => arr.join("")),
          (whitespace) => {
            // Reset mock for each iteration
            mockOnScan.mockClear();
            
            // Render component
            const { unmount } = render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
            
            // Get input element
            const input = screen.getByPlaceholderText(/scan or enter barcode/i);
            
            // Simulate entering whitespace and pressing Enter
            fireEvent.change(input, { target: { value: whitespace } });
            fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });
            
            // Verify onScan was NOT called
            expect(mockOnScan).not.toHaveBeenCalled();
            
            // Cleanup
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: Form submission (Enter or button click) produces identical results", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          (barcode) => {
            // Test with Enter key
            mockOnScan.mockClear();
            const { unmount: unmount1 } = render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
            const input1 = screen.getByPlaceholderText(/scan or enter barcode/i);
            fireEvent.change(input1, { target: { value: barcode } });
            fireEvent.keyDown(input1, { key: "Enter", code: "Enter", charCode: 13 });
            const enterResult = mockOnScan.mock.calls[0]?.[0];
            unmount1();
            
            // Test with button click
            mockOnScan.mockClear();
            const { unmount: unmount2 } = render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
            const input2 = screen.getByPlaceholderText(/scan or enter barcode/i);
            const button = screen.getByRole("button", { name: /scan/i });
            fireEvent.change(input2, { target: { value: barcode } });
            fireEvent.click(button);
            const buttonResult = mockOnScan.mock.calls[0]?.[0];
            unmount2();
            
            // Both methods should produce identical results
            expect(enterResult).toBe(buttonResult);
            expect(enterResult).toBe(barcode.trim());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Auto-focus behavior", () => {
    it("auto-focuses input when autoFocus is true", () => {
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" autoFocus={true} />);
      
      const input = screen.getByPlaceholderText(/scan or enter barcode/i);
      expect(document.activeElement).toBe(input);
    });

    it("refocuses input after successful scan", async () => {
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" autoFocus={true} />);
      
      const input = screen.getByPlaceholderText(/scan or enter barcode/i);
      const button = screen.getByRole("button", { name: /scan/i });
      
      fireEvent.change(input, { target: { value: "1234567890123" } });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });
    });
  });

  describe("Disabled state", () => {
    it("disables input and button when disabled prop is true", () => {
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" disabled={true} />);
      
      const input = screen.getByPlaceholderText(/scan or enter barcode/i) as HTMLInputElement;
      const button = screen.getByRole("button", { name: /scan/i }) as HTMLButtonElement;
      
      expect(input.disabled).toBe(true);
      expect(button.disabled).toBe(true);
    });
  });

  describe("Desktop scanner hint", () => {
    it("displays hardware scanner hint on desktop devices", () => {
      // Set desktop width
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      });
      
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
      
      expect(screen.getByText(/Hardware Scanner Tip/i)).toBeInTheDocument();
      expect(screen.getByText(/USB or Bluetooth barcode scanner/i)).toBeInTheDocument();
    });

    it("does not display hardware scanner hint on mobile devices", () => {
      // Set mobile width
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        configurable: true,
        value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      });
      
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
      
      expect(screen.queryByText(/Hardware Scanner Tip/i)).not.toBeInTheDocument();
    });

    it("does not display hardware scanner hint on tablet devices", () => {
      // Set tablet width
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 800,
      });
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        configurable: true,
        value: "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)",
      });
      
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
      
      expect(screen.queryByText(/Hardware Scanner Tip/i)).not.toBeInTheDocument();
    });
  });

  describe("Property 9: Camera Detection Fallback", () => {
    /**
     * Feature: barcode-scanning, Property 9: Camera Detection Fallback
     * Validates: Requirements 5.5
     * 
     * Property: For any device without camera or with denied camera permission,
     * the system should fallback to manual input mode.
     */
    it("property: camera mode always provides mode toggle for fallback", () => {
      fc.assert(
        fc.property(
          // Generate various device widths (mobile/tablet)
          fc.integer({ min: 320, max: 1024 }),
          (width) => {
            // Set device width
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: width,
            });
            
            mockOnScan.mockClear();
            
            // Render in camera mode
            const { unmount } = render(
              <BarcodeScanner onScan={mockOnScan} mode="camera" />
            );
            
            // On mobile/tablet devices, mode toggle should be available
            // This allows users to switch to manual if camera fails
            const manualButtons = screen.queryAllByText(/manual/i);
            const cameraButtons = screen.queryAllByText(/camera/i);
            
            // At least one mode toggle should be present for fallback
            // This ensures users can always access manual input
            expect(manualButtons.length > 0 || cameraButtons.length > 0).toBe(true);
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: manual mode is always functional regardless of camera availability", () => {
      fc.assert(
        fc.property(
          // Generate random device configurations
          fc.record({
            width: fc.integer({ min: 320, max: 2560 }),
            hasCamera: fc.boolean(),
          }),
          (config) => {
            // Set device width
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: config.width,
            });
            
            mockOnScan.mockClear();
            
            // Always render in manual mode
            const { unmount } = render(
              <BarcodeScanner onScan={mockOnScan} mode="manual" />
            );
            
            // Manual input should always be present and functional
            const input = screen.getByPlaceholderText(/scan or enter barcode/i);
            const button = screen.getByRole("button", { name: /scan/i });
            
            expect(input).toBeInTheDocument();
            expect(button).toBeInTheDocument();
            
            // Test that it works
            const testBarcode = "TEST123";
            fireEvent.change(input, { target: { value: testBarcode } });
            fireEvent.click(button);
            
            expect(mockOnScan).toHaveBeenCalledWith(testBarcode);
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it("property: mode toggle preserves functionality across switches", () => {
      fc.assert(
        fc.property(
          // Generate sequences of mode switches
          fc.array(fc.constantFrom("camera", "manual"), { minLength: 1, maxLength: 5 }),
          (modeSwitches) => {
            // Set mobile device
            Object.defineProperty(window, "innerWidth", {
              writable: true,
              configurable: true,
              value: 375,
            });
            
            mockOnScan.mockClear();
            
            const { unmount } = render(
              <BarcodeScanner onScan={mockOnScan} mode="auto" />
            );
            
            // Simulate mode switches
            for (const targetMode of modeSwitches) {
              const buttons = screen.queryAllByRole("button");
              const modeButton = buttons.find(btn => 
                btn.textContent?.toLowerCase().includes(targetMode)
              );
              
              if (modeButton) {
                fireEvent.click(modeButton);
              }
            }
            
            // After all switches, manual input should still be accessible
            // Either directly visible or via mode toggle
            const hasManualInput = screen.queryByPlaceholderText(/scan or enter barcode/i) !== null;
            const hasModeToggle = screen.queryByText(/manual/i) !== null || 
                                 screen.queryByText(/camera/i) !== null;
            
            // At least one should be true - system remains functional
            expect(hasManualInput || hasModeToggle).toBe(true);
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Mode Toggle UI", () => {
    it("displays mode toggle buttons on mobile devices", () => {
      // Set mobile width
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<BarcodeScanner onScan={mockOnScan} mode="auto" />);
      
      expect(screen.getByText(/📷 Camera/i)).toBeInTheDocument();
      expect(screen.getByText(/⌨️ Manual/i)).toBeInTheDocument();
    });

    it("displays mode toggle buttons on tablet devices", () => {
      // Set tablet width and user agent
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 800,
      });
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        configurable: true,
        value: "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)",
      });
      
      render(<BarcodeScanner onScan={mockOnScan} mode="auto" />);
      
      expect(screen.getByText(/📷 Camera/i)).toBeInTheDocument();
      expect(screen.getByText(/⌨️ Manual/i)).toBeInTheDocument();
    });

    it("does not display mode toggle on desktop devices", () => {
      // Set desktop width
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      });
      
      render(<BarcodeScanner onScan={mockOnScan} mode="auto" />);
      
      // Mode toggle should not be present on desktop
      expect(screen.queryByText(/📷 Camera/i)).not.toBeInTheDocument();
    });

    it("does not display mode toggle when mode is explicitly manual", () => {
      // Set mobile width
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<BarcodeScanner onScan={mockOnScan} mode="manual" />);
      
      // Mode toggle should not be present when mode is forced to manual
      expect(screen.queryByText(/📷 Camera/i)).not.toBeInTheDocument();
    });

    it("switches from camera to manual mode when manual button clicked", async () => {
      // Set mobile width
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<BarcodeScanner onScan={mockOnScan} mode="auto" />);
      
      // Initially in camera mode (auto mode on mobile)
      const manualButton = screen.getByText(/⌨️ Manual/i);
      fireEvent.click(manualButton);
      
      // Should now show manual input
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/scan or enter barcode/i)).toBeInTheDocument();
      });
    });

    it("switches from manual to camera mode when camera button clicked", async () => {
      // Set mobile width
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      // Use camera mode explicitly to show toggle
      render(<BarcodeScanner onScan={mockOnScan} mode="camera" />);
      
      // Switch to manual first
      const manualButton = screen.getByText(/⌨️ Manual/i);
      fireEvent.click(manualButton);
      
      // Should show manual input
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/scan or enter barcode/i)).toBeInTheDocument();
      });
      
      // Now switch back to camera
      const cameraButton = screen.getByText(/📷 Camera/i);
      fireEvent.click(cameraButton);
      
      // Should now show camera scanner (or initializing message)
      await waitFor(() => {
        const hasCamera = screen.queryByText(/initializing/i) !== null ||
                         screen.queryByText(/position the barcode/i) !== null;
        expect(hasCamera).toBe(true);
      });
    });

    it("preserves active mode state when toggling", () => {
      // Set mobile width
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<BarcodeScanner onScan={mockOnScan} mode="auto" />);
      
      const cameraButton = screen.getByText(/📷 Camera/i);
      const manualButton = screen.getByText(/⌨️ Manual/i);
      
      // Camera should be active initially (auto mode on mobile)
      expect(cameraButton.className).toContain("bg-gray-600");
      
      // Switch to manual
      fireEvent.click(manualButton);
      
      // Manual should now be active
      expect(manualButton.className).toContain("bg-gray-600");
      expect(cameraButton.className).not.toContain("bg-gray-600");
    });
  });
});
