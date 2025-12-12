import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { getDeviceType, isMobileDevice, hasCamera, isStandalone } from "@/lib/device-utils";

describe("Device Detection Utilities", () => {
  // Store original values
  let originalWindow: any;
  let originalNavigator: any;

  beforeEach(() => {
    // Save original values
    originalWindow = global.window;
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    // Restore original values
    global.window = originalWindow;
    global.navigator = originalNavigator;
    vi.restoreAllMocks();
  });

  describe("getDeviceType", () => {
    it("returns 'desktop' when window is undefined (SSR)", () => {
      // @ts-ignore - intentionally setting to undefined for SSR test
      global.window = undefined;
      expect(getDeviceType()).toBe("desktop");
    });

    it("returns 'mobile' for screen width < 768px", () => {
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
      expect(getDeviceType()).toBe("mobile");
    });

    it("returns 'tablet' for screen width between 768px and 1024px with tablet user agent", () => {
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
      expect(getDeviceType()).toBe("tablet");
    });

    it("returns 'desktop' for screen width >= 1024px with desktop user agent", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      });
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        configurable: true,
        value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0",
      });
      expect(getDeviceType()).toBe("desktop");
    });

    it("returns 'tablet' for large screen with tablet user agent", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1366,
      });
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        configurable: true,
        value: "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)",
      });
      expect(getDeviceType()).toBe("tablet");
    });
  });

  describe("isMobileDevice", () => {
    it("returns false when window is undefined (SSR)", () => {
      // @ts-ignore - intentionally setting to undefined for SSR test
      global.window = undefined;
      expect(isMobileDevice()).toBe(false);
    });

    it("returns true for mobile devices", () => {
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
      expect(isMobileDevice()).toBe(true);
    });

    it("returns false for tablet devices", () => {
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
      expect(isMobileDevice()).toBe(false);
    });

    it("returns false for desktop devices", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      });
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        configurable: true,
        value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0",
      });
      expect(isMobileDevice()).toBe(false);
    });
  });

  describe("hasCamera", () => {
    it("returns false when navigator is undefined", async () => {
      // @ts-ignore - intentionally setting to undefined
      global.navigator = undefined;
      expect(await hasCamera()).toBe(false);
    });

    it("returns false when mediaDevices is not supported", async () => {
      Object.defineProperty(navigator, "mediaDevices", {
        writable: true,
        configurable: true,
        value: undefined,
      });
      expect(await hasCamera()).toBe(false);
    });

    it("returns false when getUserMedia is not supported", async () => {
      Object.defineProperty(navigator, "mediaDevices", {
        writable: true,
        configurable: true,
        value: {
          getUserMedia: undefined,
        },
      });
      expect(await hasCamera()).toBe(false);
    });

    it("returns true when video input device is found", async () => {
      const mockEnumerateDevices = vi.fn().mockResolvedValue([
        { kind: "audioinput", deviceId: "audio1" },
        { kind: "videoinput", deviceId: "video1" },
      ]);

      Object.defineProperty(navigator, "mediaDevices", {
        writable: true,
        configurable: true,
        value: {
          getUserMedia: vi.fn(),
          enumerateDevices: mockEnumerateDevices,
        },
      });

      expect(await hasCamera()).toBe(true);
      expect(mockEnumerateDevices).toHaveBeenCalled();
    });

    it("returns false when no video input device is found", async () => {
      const mockEnumerateDevices = vi.fn().mockResolvedValue([
        { kind: "audioinput", deviceId: "audio1" },
        { kind: "audiooutput", deviceId: "audio2" },
      ]);

      Object.defineProperty(navigator, "mediaDevices", {
        writable: true,
        configurable: true,
        value: {
          getUserMedia: vi.fn(),
          enumerateDevices: mockEnumerateDevices,
        },
      });

      expect(await hasCamera()).toBe(false);
    });

    it("returns false when enumerateDevices throws an error", async () => {
      const mockEnumerateDevices = vi.fn().mockRejectedValue(new Error("Permission denied"));

      Object.defineProperty(navigator, "mediaDevices", {
        writable: true,
        configurable: true,
        value: {
          getUserMedia: vi.fn(),
          enumerateDevices: mockEnumerateDevices,
        },
      });

      expect(await hasCamera()).toBe(false);
    });
  });

  describe("isStandalone", () => {
    it("returns false when window is undefined (SSR)", () => {
      // @ts-ignore - intentionally setting to undefined for SSR test
      global.window = undefined;
      expect(isStandalone()).toBe(false);
    });

    it("returns true when running in iOS standalone mode", () => {
      Object.defineProperty(navigator, "standalone", {
        writable: true,
        configurable: true,
        value: true,
      });

      const mockMatchMedia = vi.fn().mockReturnValue({ matches: false });
      window.matchMedia = mockMatchMedia;

      expect(isStandalone()).toBe(true);
    });

    it("returns true when running in Android/Chrome standalone mode", () => {
      Object.defineProperty(navigator, "standalone", {
        writable: true,
        configurable: true,
        value: undefined,
      });

      const mockMatchMedia = vi.fn().mockReturnValue({ matches: true });
      window.matchMedia = mockMatchMedia;

      expect(isStandalone()).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith("(display-mode: standalone)");
    });

    it("returns false when not running in standalone mode", () => {
      Object.defineProperty(navigator, "standalone", {
        writable: true,
        configurable: true,
        value: false,
      });

      const mockMatchMedia = vi.fn().mockReturnValue({ matches: false });
      window.matchMedia = mockMatchMedia;

      expect(isStandalone()).toBe(false);
    });

    it("returns true when both iOS and Android standalone modes are active", () => {
      Object.defineProperty(navigator, "standalone", {
        writable: true,
        configurable: true,
        value: true,
      });

      const mockMatchMedia = vi.fn().mockReturnValue({ matches: true });
      window.matchMedia = mockMatchMedia;

      expect(isStandalone()).toBe(true);
    });
  });
});
