import { describe, it, expect, beforeEach, vi } from "vitest";
import * as THREE from "three";

// Mock document and browser APIs
beforeEach(() => {
  // Mock document.documentElement
  const mockDocumentElement = {
    getAttribute: vi.fn((attr: string) => {
      if (attr === "data-theme") return "light";
      return null;
    }),
  };

  // Mock getComputedStyle
  global.getComputedStyle = vi.fn(() => ({
    getPropertyValue: vi.fn((prop: string) => {
      if (prop === "--color-raised") return "oklch(0.98 0.002 264)";
      if (prop === "--color-accent") return "oklch(0.5 0.15 264)";
      return "";
    }),
  })) as any;

  // Mock canvas and 2d context
  const mockContext = {
    fillStyle: "",
    fillRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: [255, 255, 255, 255],
    })),
  };

  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => mockContext),
  };

  global.document = {
    documentElement: mockDocumentElement,
    createElement: vi.fn((tag: string) => {
      if (tag === "canvas") return mockCanvas;
      return {};
    }),
  } as any;

  // Mock MutationObserver
  global.MutationObserver = vi.fn(function (this: any, callback) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.callback = callback;
  }) as any;
});

describe("relief-palette", () => {
  // Dynamic import after mocks are set up
  let readReliefPalette: any;
  let watchThemeChanges: any;

  beforeEach(async () => {
    const paletteModule = await import("./relief-palette");
    readReliefPalette = paletteModule.readReliefPalette;
    watchThemeChanges = paletteModule.watchThemeChanges;
  });

  describe("readReliefPalette", () => {
    it("returns a palette object with required properties", () => {
      const palette = readReliefPalette();

      expect(palette).toBeDefined();
      expect(palette.cubeColor).toBeInstanceOf(THREE.Color);
      expect(palette.emissiveColor).toBeInstanceOf(THREE.Color);
      expect(typeof palette.lightIntensity).toBe("number");
      expect(typeof palette.ambientIntensity).toBe("number");
    });

    it("produces positive intensity values", () => {
      const palette = readReliefPalette();

      expect(palette.lightIntensity).toBeGreaterThan(0);
      expect(palette.ambientIntensity).toBeGreaterThan(0);
    });

    it("reads theme attribute from document element", () => {
      readReliefPalette();

      expect(document.documentElement.getAttribute).toHaveBeenCalledWith("data-theme");
    });

    it("calls getComputedStyle to read CSS variables", () => {
      readReliefPalette();

      expect(global.getComputedStyle).toHaveBeenCalledWith(document.documentElement);
    });

    it("creates canvas element to convert colors", () => {
      readReliefPalette();

      expect(document.createElement).toHaveBeenCalledWith("canvas");
    });

    it("handles light theme", () => {
      vi.mocked(document.documentElement.getAttribute).mockReturnValue("light");

      const palette = readReliefPalette();

      expect(palette.lightIntensity).toBeLessThan(1.5);
      expect(palette.ambientIntensity).toBeLessThan(1.5);
    });

    it("handles dark theme with higher intensities", () => {
      vi.mocked(document.documentElement.getAttribute).mockReturnValue("dark");

      const palette = readReliefPalette();

      expect(palette.lightIntensity).toBeGreaterThan(1.0);
      expect(palette.ambientIntensity).toBeGreaterThan(1.0);
    });

    it("uses fallback colors when CSS variables are missing", () => {
      vi.mocked(global.getComputedStyle).mockReturnValue({
        getPropertyValue: vi.fn(() => ""),
      } as any);

      const palette = readReliefPalette();

      expect(palette.cubeColor).toBeInstanceOf(THREE.Color);
      expect(palette.emissiveColor).toBeInstanceOf(THREE.Color);
    });

    it("handles canvas getContext failure gracefully", () => {
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => null),
      };

      vi.mocked(document.createElement).mockReturnValue(mockCanvas as any);

      const palette = readReliefPalette();

      expect(palette.cubeColor).toBeInstanceOf(THREE.Color);
    });

    it("handles getImageData exceptions", () => {
      const mockContext = {
        fillStyle: "",
        fillRect: vi.fn(),
        getImageData: vi.fn(() => {
          throw new Error("Canvas error");
        }),
      };

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
      };

      vi.mocked(document.createElement).mockReturnValue(mockCanvas as any);

      const palette = readReliefPalette();

      expect(palette.cubeColor).toBeInstanceOf(THREE.Color);
    });
  });

  describe("watchThemeChanges", () => {
    it("returns a disconnect function", () => {
      const callback = vi.fn();
      const disconnect = watchThemeChanges(callback);

      expect(typeof disconnect).toBe("function");
    });

    it("creates a MutationObserver", () => {
      const callback = vi.fn();
      watchThemeChanges(callback);

      expect(MutationObserver).toHaveBeenCalledWith(callback);
    });

    it("observes data-theme attribute changes", () => {
      const callback = vi.fn();
      watchThemeChanges(callback);

      const observerInstance = vi.mocked(MutationObserver).mock.results[0]?.value;
      if (!observerInstance) throw new Error("MutationObserver was not constructed");
      expect(observerInstance.observe).toHaveBeenCalledWith(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    });

    it("disconnect function calls observer disconnect", () => {
      const callback = vi.fn();
      const disconnect = watchThemeChanges(callback);

      const observerInstance = vi.mocked(MutationObserver).mock.results[0]?.value;
      if (!observerInstance) throw new Error("MutationObserver was not constructed");

      disconnect();

      expect(observerInstance.disconnect).toHaveBeenCalled();
    });
  });

  describe("color conversion", () => {
    it("converts RGB values to hex format", () => {
      const mockContext = {
        fillStyle: "",
        fillRect: vi.fn(),
        getImageData: vi.fn(() => ({
          data: [171, 205, 239, 255],
        })),
      };

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
      };

      vi.mocked(document.createElement).mockReturnValue(mockCanvas as any);

      const palette = readReliefPalette();

      expect(palette.cubeColor).toBeInstanceOf(THREE.Color);
    });

    it("handles pure black RGB values", () => {
      const mockContext = {
        fillStyle: "",
        fillRect: vi.fn(),
        getImageData: vi.fn(() => ({
          data: [0, 0, 0, 255],
        })),
      };

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
      };

      vi.mocked(document.createElement).mockReturnValue(mockCanvas as any);

      const palette = readReliefPalette();

      expect(palette.cubeColor).toBeInstanceOf(THREE.Color);
    });

    it("handles pure white RGB values", () => {
      const mockContext = {
        fillStyle: "",
        fillRect: vi.fn(),
        getImageData: vi.fn(() => ({
          data: [255, 255, 255, 255],
        })),
      };

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
      };

      vi.mocked(document.createElement).mockReturnValue(mockCanvas as any);

      const palette = readReliefPalette();

      expect(palette.cubeColor).toBeInstanceOf(THREE.Color);
    });
  });
});
