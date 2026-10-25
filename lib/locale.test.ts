import { describe, it, expect } from "vitest";
import {
  locales,
  publishedLocales,
  defaultLocale,
  isLocale,
  isPublishedLocale,
  localizedPath,
  localeAlternates,
  resolveLocaleFromAcceptLanguage,
} from "./locale";

describe("locale", () => {
  describe("isLocale", () => {
    it("returns true for valid locales", () => {
      expect(isLocale("en")).toBe(true);
      expect(isLocale("id")).toBe(true);
      expect(isLocale("ja")).toBe(true);
    });

    it("returns false for invalid locales", () => {
      expect(isLocale("fr")).toBe(false);
      expect(isLocale("es")).toBe(false);
      expect(isLocale("ko")).toBe(false);
    });

    it("returns false for non-string values", () => {
      expect(isLocale(undefined)).toBe(false);
      expect(isLocale(null)).toBe(false);
      expect(isLocale("")).toBe(false);
    });
  });

  describe("isPublishedLocale", () => {
    it("accepts the locales the site publishes routes for", () => {
      for (const locale of publishedLocales) {
        expect(isPublishedLocale(locale)).toBe(true);
      }
    });

    /* `ja` has a dictionary skeleton but no routes: publishing it would render
       "[Japanese … to be translated]" under a linked URL. Routing therefore
       has to reject it even though the type universe accepts it. */
    it("rejects a locale that exists only as a dictionary skeleton", () => {
      expect(isLocale("ja")).toBe(true);
      expect(isPublishedLocale("ja")).toBe(false);
    });

    it("rejects unknown and non-string values", () => {
      expect(isPublishedLocale("fr")).toBe(false);
      expect(isPublishedLocale(undefined)).toBe(false);
      expect(isPublishedLocale(null)).toBe(false);
    });

    it("publishes a subset of the locales the type universe carries", () => {
      for (const locale of publishedLocales) {
        expect(locales).toContain(locale);
      }
      expect(publishedLocales.length).toBeLessThanOrEqual(locales.length);
    });

    it("keeps the published default first in the published set", () => {
      expect(publishedLocales[0]).toBe(defaultLocale);
    });
  });

  describe("localizedPath", () => {
    it("prefixes path with locale", () => {
      expect(localizedPath("en", "/projects/atlas")).toBe("/en/projects/atlas");
      expect(localizedPath("id", "/projects/atlas")).toBe("/id/projects/atlas");
    });

    it("handles root path", () => {
      expect(localizedPath("en", "/")).toBe("/en");
      expect(localizedPath("id", "/")).toBe("/id");
    });

    it("handles default empty path", () => {
      expect(localizedPath("en")).toBe("/en");
      expect(localizedPath("id")).toBe("/id");
    });

    it("normalizes paths without leading slash", () => {
      expect(localizedPath("en", "projects/atlas")).toBe("/en/projects/atlas");
      expect(localizedPath("id", "about")).toBe("/id/about");
    });
  });

  describe("localeAlternates", () => {
    it("returns every published locale for the root path", () => {
      const alternates = localeAlternates("/");
      expect(alternates).toEqual({
        en: "/en",
        id: "/id",
        "x-default": "/en",
      });
    });

    it("returns every published locale for a nested path", () => {
      const alternates = localeAlternates("/projects/atlas");
      expect(alternates).toEqual({
        en: "/en/projects/atlas",
        id: "/id/projects/atlas",
        "x-default": "/en/projects/atlas",
      });
    });

    /* An hreflang pointing at a placeholder dictionary tells a crawler that a
       half-translated page is a legitimate translation of this one. */
    it("never advertises an unpublished dictionary", () => {
      expect(localeAlternates("/")).not.toHaveProperty("ja");
      expect(Object.keys(localeAlternates("/"))).toEqual([
        ...publishedLocales,
        "x-default",
      ]);
    });

    it("uses default locale for x-default", () => {
      const alternates = localeAlternates("/about");
      expect(alternates["x-default"]).toBe(`/${defaultLocale}/about`);
    });

    it("includes all published locales", () => {
      const alternates = localeAlternates("/test");
      for (const locale of publishedLocales) {
        expect(alternates[locale]).toBeDefined();
      }
    });
  });

  describe("resolveLocaleFromAcceptLanguage", () => {
    it("returns default locale for null header", () => {
      expect(resolveLocaleFromAcceptLanguage(null)).toBe(defaultLocale);
    });

    it("returns default locale for empty header", () => {
      expect(resolveLocaleFromAcceptLanguage("")).toBe(defaultLocale);
    });

    it("resolves single supported locale", () => {
      expect(resolveLocaleFromAcceptLanguage("en")).toBe("en");
      expect(resolveLocaleFromAcceptLanguage("id")).toBe("id");
    });

    it("resolves locale with region code", () => {
      expect(resolveLocaleFromAcceptLanguage("en-US")).toBe("en");
      expect(resolveLocaleFromAcceptLanguage("en-GB")).toBe("en");
      expect(resolveLocaleFromAcceptLanguage("id-ID")).toBe("id");
    });

    it("respects quality values", () => {
      expect(resolveLocaleFromAcceptLanguage("en;q=0.4, id;q=0.9")).toBe("id");
      expect(resolveLocaleFromAcceptLanguage("id;q=0.3, en;q=0.8")).toBe("en");
    });

    it("uses declaration order to break quality ties", () => {
      expect(resolveLocaleFromAcceptLanguage("fr, id")).toBe("id");
      expect(resolveLocaleFromAcceptLanguage("id, en")).toBe("id");
      expect(resolveLocaleFromAcceptLanguage("en, id")).toBe("en");
    });

    it("skips unsupported locales", () => {
      expect(resolveLocaleFromAcceptLanguage("fr, es, en")).toBe("en");
      expect(resolveLocaleFromAcceptLanguage("ko, fr, id")).toBe("id");
    });

    it("resolves every published locale tag", () => {
      for (const locale of publishedLocales) {
        expect(resolveLocaleFromAcceptLanguage(locale)).toBe(locale);
      }
    });

    /* The skeleton dictionary must not pull traffic: a Japanese browser gets
       the fallback page, which exists, instead of a route that would 404. */
    it("falls back rather than resolving a locale with no routes", () => {
      expect(resolveLocaleFromAcceptLanguage("ja")).toBe(defaultLocale);
      expect(resolveLocaleFromAcceptLanguage("ja-JP,ja;q=0.9")).toBe(defaultLocale);
      expect(resolveLocaleFromAcceptLanguage("ja, id;q=0.4")).toBe("id");
    });

    it("ignores wildcard and zero-quality tags", () => {
      expect(resolveLocaleFromAcceptLanguage("*, en")).toBe("en");
      expect(resolveLocaleFromAcceptLanguage("fr;q=0, id")).toBe("id");
      expect(resolveLocaleFromAcceptLanguage("en;q=0.0, id;q=0.5")).toBe("id");
    });

    it("handles complex real-world headers", () => {
      expect(
        resolveLocaleFromAcceptLanguage("en-US,en;q=0.9,id;q=0.8,fr;q=0.7"),
      ).toBe("en");
      expect(
        resolveLocaleFromAcceptLanguage("id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"),
      ).toBe("id");
    });

    it("handles case insensitivity", () => {
      expect(resolveLocaleFromAcceptLanguage("EN")).toBe("en");
      expect(resolveLocaleFromAcceptLanguage("Id")).toBe("id");
      expect(resolveLocaleFromAcceptLanguage("EN-us")).toBe("en");
    });
  });
});
