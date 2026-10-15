import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* Behavioural contract for the portfolio. Each test pins one promise the site
   makes: locale routing, metadata, not-found handling, layout at phone width,
   and the keyboard behaviour of the certificate lightbox. */

const LOCALES = ["en", "id"] as const;
const SITE = "https://portofolio-one-xi-42.vercel.app";

async function noHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, "page must not scroll sideways").toBeLessThanOrEqual(clientWidth);
}

test.describe("routing", () => {
  test("unprefixed root redirects to a locale", async ({ request }) => {
    const response = await request.get("/", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toMatch(/\/(en|id)$/);
  });

  for (const locale of LOCALES) {
    test(`/${locale} renders the home page in its own language`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toBeVisible();
    });
  }

  test("unknown locale is a 404", async ({ request }) => {
    const response = await request.get("/fr");
    expect(response.status()).toBe(404);
  });

  test("unknown project slug is a 404", async ({ request }) => {
    const response = await request.get("/en/projects/does-not-exist");
    expect(response.status()).toBe(404);
  });
});

test.describe("metadata", () => {
  for (const locale of LOCALES) {
    test(`/${locale} declares canonical and hreflang alternates`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`/${locale}$`),
      );
      for (const alt of ["en", "id", "x-default"]) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${alt}"]`)).toHaveCount(1);
      }
    });
  }

  test("canonical and sitemap use the production origin, not a dead host", async ({ page, request }) => {
    await page.goto("/en");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical?.startsWith(SITE)).toBe(true);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain(`<loc>${SITE}/en</loc>`);
  });

  test("sitemap lists both locales", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("/en");
    expect(body).toContain("/id");
  });

  test("web manifest and service worker are served", async ({ request }) => {
    expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
    expect((await request.get("/sw.js")).status()).toBe(200);
  });
});

test.describe("layout", () => {
  test("home page does not overflow at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/en");
    await noHorizontalOverflow(page);
  });

  test("case study does not overflow at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/en/projects/fcopier");
    await noHorizontalOverflow(page);
  });

  test("work section lists every project", async ({ page }) => {
    await page.goto("/en");
    const work = page.locator("#work");
    await expect(work.locator("article a").first()).toBeVisible();
    await expect(work.locator("[data-cursor-label]")).toHaveCount(5);
  });
});

test.describe("certificate lightbox", () => {
  test("opens on click and closes on Escape", async ({ page }) => {
    await page.goto("/en");
    const frame = page.locator(".tilt-frame").first();
    await frame.scrollIntoViewIfNeeded();
    await frame.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});

test.describe("accessibility", () => {
  for (const locale of LOCALES) {
    test(`/${locale} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(`/${locale}`);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      const blocking = results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      );
      expect(
        blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`),
        "blocking axe violations",
      ).toEqual([]);
    });
  }
});

test.describe("case-study metrics", () => {
  test("count-up runs from the scrolled-into-view moment, not from mount", async ({ page }) => {
    await page.goto("/en/projects/aegisx");
    await page.waitForTimeout(1500);
    const metric = page.locator("dl dd span", { hasText: /^768$/ });

    /* Record every distinct text value the metric shows, from the moment it
       scrolls into view, for the length of the tween. Recording happens in
       the page so no frame is missed by the test runner's round-trips. */
    await page.evaluate(() => {
      const element = [...document.querySelectorAll("dl dd span")].find(
        (node) => node.textContent?.trim() === "768",
      ) as HTMLElement;
      const seen: string[] = [];
      (window as unknown as { __countSamples: string[] }).__countSamples = seen;
      const start = performance.now();
      const tick = () => {
        if (seen.at(-1) !== element.textContent) seen.push(element.textContent ?? "");
        if (performance.now() - start < 3000) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    await metric.scrollIntoViewIfNeeded();
    await page.waitForTimeout(3200);

    const samples = await page.evaluate(
      () => (window as unknown as { __countSamples: string[] }).__countSamples,
    );
    /* The server renders the final value (768), so the first sample is
       already 768. What proves the tween is the number of distinct values
       in between: a static metric would produce a single sample. */
    const intermediate = samples.filter((value) => value !== "768");
    expect(intermediate.length, `intermediate values: ${samples.join(", ")}`).toBeGreaterThan(5);
    await expect(metric).toHaveText("768");
  });
});

test.describe("project row preview", () => {
  test("preview image for FCopier is served and decodes", async ({ page, request }) => {
    // The asset itself must exist and be a PNG, regardless of viewport.
    const asset = await request.get("/projects/fcopier-preview.png");
    expect(asset.status()).toBe(200);
    expect(asset.headers()["content-type"]).toContain("image/");

    // The gutter card only exists at >= 1800px (see globals.css), so the
    // hover check runs at that width.
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto("/en");
    const preview = page.locator(".row-preview img");
    await expect(preview).toHaveCount(1);
    // Hover the row so the preview is shown on a fine pointer, then the
    // image must finish decoding at a real size.
    const row = page.locator("[data-cursor-label]", { has: preview });
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await expect(page.locator(".row-preview")).toBeVisible();
    await expect
      .poll(() => preview.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0);
  });

  test("hovering a row shows its preview without moving the title", async ({ page }, testInfo) => {
    /* The preview only exists at >= 1800px, so the 320px project has no
       preview to measure. The desktop project covers this behaviour. */
    test.skip(testInfo.project.name !== "desktop", "preview is gated to >= 1800px");
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto("/en");
    const row = page.locator("[data-cursor-label]", { has: page.locator(".row-preview img") });
    await row.scrollIntoViewIfNeeded();
    /* Let smooth scrolling and the reveal settle first, or the "before"
       measurement races the page and reads a position it is still moving to. */
    await page.waitForTimeout(1200);
    const titleBefore = await row.locator("span.text-row").first().boundingBox();
    await row.hover();
    await expect(page.locator(".row-preview")).toHaveCSS("opacity", "1");
    await page.waitForTimeout(400);
    const titleAfter = await row.locator("span.text-row").first().boundingBox();
    /* The row already nudges its title 4px right on hover (group-hover:
       translate-x-1, an existing affordance). The preview must add no vertical
       shift, so the test pins y exactly and bounds x to that 4px nudge. */
    expect(titleAfter?.y).toBeCloseTo(titleBefore?.y ?? 0, 0);
    expect(Math.abs((titleAfter?.x ?? 0) - (titleBefore?.x ?? 0))).toBeLessThanOrEqual(5);
  });

  test("preview stays hidden on touch-width layouts", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    await expect(page.locator(".row-preview").first()).toBeHidden();
  });
});

test.describe("cursor label", () => {
  test("stays invisible until a project row is hovered", async ({ page }) => {
    await page.goto("/en");
    const label = page.locator(".cursor-label");
    // Playwright Chromium reports a fine pointer, so the element is laid out
    // (display: block) but must be transparent until a row is hovered.
    await expect(label).toHaveCSS("opacity", "0");
    const row = page.locator("[data-cursor-label]").first();
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await expect(label).toHaveAttribute("data-visible", "true");
    await expect(label).toHaveCSS("opacity", "1");
    // Leaving the row to the page header hides it again.
    await page.locator("header").first().hover();
    await expect(label).toHaveAttribute("data-visible", "false");
  });

  test("shows the localised label text", async ({ page }) => {
    await page.goto("/id");
    await expect(page.locator(".cursor-label")).toHaveText("Lihat");
  });
});

test.describe("accessibility: case study", () => {
  for (const locale of LOCALES) {
    test(`/${locale}/projects/fcopier has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(`/${locale}/projects/fcopier`);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      const blocking = results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      );
      expect(
        blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`),
        "blocking axe violations",
      ).toEqual([]);
    });
  }
});

test.describe("3D motion switch", () => {
  test("footer switch toggles aria-pressed and persists the choice", async ({ page }) => {
    await page.goto("/en");
    const toggle = page.getByRole("button", { name: /3D motion/i });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("html")).toHaveClass(/motion-3d-off/);
    await page.reload();
    await expect(page.getByRole("button", { name: /3D motion/i })).toHaveAttribute("aria-pressed", "false");
  });

  test("with motion off, the hero canvas is never mounted", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem("portfolio-3d-motion", "off"));
    await page.goto("/en");
    await page.waitForTimeout(1200);
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
