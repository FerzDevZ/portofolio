import { test, expect } from "@playwright/test";

/* Regressions this file exists to catch.
 *
 * Every assertion here failed at least once before it was written, and each
 * one failed *silently* — the build exited 0, the route table still printed
 * `● SSG`, and no other test noticed. They are deliberately cheap: response
 * headers and raw HTML, no browser. */

test.describe("static rendering", () => {
  test("home pages are prerendered and cacheable", async ({ request }) => {
    for (const locale of ["en", "id"]) {
      const response = await request.get(`/${locale}`);
      expect(response.status()).toBe(200);
      /* A dynamic API anywhere in the `[lang]` tree turned every page into a
         per-request render with `no-store`, and nothing in the build said so. */
      expect(
        response.headers()["x-nextjs-cache"],
        `/${locale} must be served from the prerender cache`,
      ).toBe("HIT");
      expect(response.headers()["cache-control"]).toContain("s-maxage");
    }
  });

  test("metadata stays inside <head>", async ({ request }) => {
    const html = await (await request.get("/en")).text();
    const headEndsAt = html.indexOf("</head>");
    expect(headEndsAt).toBeGreaterThan(0);
    for (const marker of ['rel="canonical"', 'property="og:image"', "<title"]) {
      expect(html.indexOf(marker), `${marker} must be in <head>`).toBeLessThan(
        headEndsAt,
      );
    }
  });

  test("a case study names its share card", async ({ request }) => {
    const html = await (await request.get("/en/projects/aegisx")).text();
    /* The page-level `openGraph` object replaces the layout's, which is how the
       file-convention image stopped being inherited and the most shareable
       pages ended up with no `og:image` at all. */
    expect(html).toContain('property="og:image"');
    expect(html).toContain('property="og:image:width" content="1200"');
    expect(html).toContain('property="og:image:height" content="630"');
  });

  test("the 404 carries no canonical and exactly one robots directive", async ({
    request,
  }) => {
    const response = await request.get("/en/no-such-page");
    expect(response.status()).toBe(404);
    const html = await response.text();
    /* A canonical inherited from the layout told a crawler that every missing
       URL was a duplicate of the home page. */
    expect(html).not.toContain('rel="canonical"');
    expect((html.match(/name="robots"/g) ?? []).length).toBe(1);
  });

  test("the sitemap lists every route in both locales", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    /* 10 dictionary/footer paths × 2 locales, plus one article per locale.
       The featured case study fell out of this list once because the sitemap
       read a different array than `generateStaticParams`. */
    expect((xml.match(/<loc>/g) ?? []).length).toBe(22);
    expect((xml.match(/hreflang=/g) ?? []).length).toBe(66);

    /* Every page reachable from the footer is advertised in both locales. */
    for (const path of [
      "/en/blog",
      "/id/blog",
      "/en/contact",
      "/id/contact",
      "/en/resume",
      "/id/resume",
      "/en/blog/getting-started-nextjs",
    ]) {
      expect(xml).toContain(`${path}</loc>`);
    }
  });
});

test.describe("resume PDF endpoint", () => {
  test("an unpublished locale is a 400 from the handler, not a localized 404", async ({
    request,
  }) => {
    /* Two silent defects met here. The middleware treated `api` as a language
       tag and rewrote `/api/resume` into `[lang]/[...rest]`, so every request
       to the endpoint answered with the localized 404 while the handler never
       ran; and the handler's `isLocale` guard accepted `ja`, a locale with a
       dictionary but no routes, which Chromium would have paginated into a
       file named Resume.pdf. A 400 is only reachable when the route is the
       one answering AND the guard is the published-locale predicate. */
    const response = await request.get("/api/resume?lang=ja");
    expect(response.status()).toBe(400);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(await response.json()).toEqual({ error: "Unsupported locale: ja" });
  });
});

test.describe("hero layering", () => {
  test("the poster paints behind the canvas, not over it", async ({ page }) => {
    await page.goto("/en");
    await page.waitForFunction(
      () => document.querySelectorAll("canvas").length > 0,
      undefined,
      { timeout: 30_000 },
    );

    const layers = await page.evaluate(() => {
      const poster = document.querySelector(".hero-scene-poster");
      const frame = document.querySelector(".hero-scene-frame");
      if (!poster || !frame) return null;
      const posterStyle = getComputedStyle(poster);
      const frameStyle = getComputedStyle(frame);
      return {
        posterZ: posterStyle.zIndex,
        frameZ: frameStyle.zIndex,
        posterPosition: posterStyle.position,
        framePosition: frameStyle.position,
        /* Document order: the poster is the later sibling, which is why it won
           the paint order while both had `z-index: auto`. */
        posterAfterFrame:
          poster.compareDocumentPosition(frame) ===
          Node.DOCUMENT_POSITION_PRECEDING,
      };
    });

    expect(layers).not.toBeNull();
    /* Both elements are absolutely positioned; with `z-index: auto` the poster,
       which is the later sibling, painted on top and washed out the relief.
       (A hit-test cannot answer this: `.hero-scene-slot` sets
       `pointer-events: none`, so neither element is returned by
       `elementsFromPoint`.) */
    expect(layers!.posterPosition).toBe("absolute");
    expect(layers!.framePosition).toBe("absolute");
    expect(layers!.posterAfterFrame).toBe(true);
    expect(layers!.posterZ).toBe("0");
    expect(layers!.frameZ).toBe("1");
  });

  test("the certificate tilt rotates the card inside the perspective frame", async ({
    page,
  }) => {
    await page.goto("/en");
    const frame = page.locator(".tilt-frame").first();
    await frame.scrollIntoViewIfNeeded();
    const card = page.locator(".tilt-card").first();

    const before = await card.evaluate((element) => element.style.transform);
    await frame.hover({ position: { x: 40, y: 30 } });
    const after = await card.evaluate((element) => element.style.transform);

    /* `perspective` only projects *children*, so the rotation has to be written
       on the card. Writing it on the frame produced no projection at all. */
    const perspective = await frame.evaluate(
      (element) => getComputedStyle(element).perspective,
    );
    expect(perspective).not.toBe("none");
    expect(before).toBe("");
    expect(after).toContain("rotateX");
  });
});

test.describe("locale negotiation", () => {
  test("an unsupported language tag is a 404 at its own URL", async ({
    request,
  }) => {
    /* Used to be a 307 to `/en/fr` and a 404 two hops later, with a cookie
       written for a path that never existed. */
    const response = await request.get("/fr", { maxRedirects: 0 });
    expect(response.status()).toBe(404);
    expect(response.headers()["location"]).toBeUndefined();
  });

  test("a wrongly-cased locale is canonicalised", async ({ request }) => {
    const response = await request.get("/EN", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers()["location"]).toMatch(/\/en$/);
  });

  test("the locale redirect is not cacheable by a shared cache", async ({
    request,
  }) => {
    const response = await request.get("/", { maxRedirects: 0 });
    /* The target depends on `Cookie` and `Accept-Language`; a cached 307 would
       hand one visitor's language to the next. */
    expect(response.headers()["vary"]).toContain("Accept-Language");
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("an unknown forwarded host cannot redirect off-site", async ({
    request,
  }) => {
    const response = await request.get("/about", {
      maxRedirects: 0,
      headers: { "x-forwarded-host": "evil.example" },
    });
    expect(response.headers()["location"] ?? "").not.toContain("evil.example");
  });

  test("a dotted path under a locale still reaches the localized 404", async ({
    request,
  }) => {
    /* The middleware matcher used to drop every path containing a dot, so
       `/id/foo.bar` fell through to an English 404 under an Indonesian URL. */
    const response = await request.get("/id/foo.bar");
    expect(response.status()).toBe(404);
  });
});
