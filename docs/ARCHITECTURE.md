# Architecture Documentation

## System Overview

This portfolio is a **statically-generated, locale-first Next.js application** with zero runtime i18n dependencies. Every page is prerendered at build time, and locale detection happens in middleware before routing reaches any page component.

### Core Design Decisions

1. **Locale-in-URL**: Every route is prefixed with `/en` or `/id`, allowing each page to remain static
2. **No i18n libraries**: Content dictionaries are plain TypeScript objects satisfying a shared interface
3. **Middleware-based language detection**: Unprefixed URLs redirect to a locale based on cookie, Accept-Language header, or fallback
4. **Single source of truth**: All translatable content lives in `lib/content/en.ts` and `lib/content/id.ts`
5. **Type-safe content**: Both dictionaries implement the same `PortfolioContent` interface

---

## Routing Architecture

### URL Structure

```
/                          → Middleware redirect to /en or /id
/en                        → English home page (static)
/id                        → Indonesian home page (static)
/en/projects/fcopier       → English case study (static)
/id/projects/fcopier       → Indonesian case study (static)
/en/some-unknown-path      → 404 with English copy
/id/some-unknown-path      → 404 with Indonesian copy
/fr                        → 404 (unsupported locale)
```

### Routing Flow

```mermaid
flowchart TD
    Request[Incoming Request] --> Middleware{Middleware}
    Middleware -->|Path has locale?| CheckLocale{Valid locale?}
    CheckLocale -->|Yes| Layout[app/[lang]/layout.tsx]
    CheckLocale -->|No| NotFound404[404 Response]
    
    Middleware -->|No locale prefix| DetectLocale[Detect Locale]
    DetectLocale --> Cookie{NEXT_LOCALE cookie?}
    Cookie -->|Yes| RedirectCookie[Redirect to /{cookie}/path]
    Cookie -->|No| AcceptLang{Accept-Language?}
    AcceptLang -->|Yes| ParseHeader[Parse quality values]
    ParseHeader --> RedirectLang[Redirect to /{detected}/path]
    AcceptLang -->|No| RedirectDefault[Redirect to /en/path]
    
    Layout --> Page{Route exists?}
    Page -->|Yes| RenderPage[Render Static Page]
    Page -->|No| NotFoundPage[app/[lang]/not-found.tsx]
    
    RenderPage --> Response[HTML Response]
    NotFoundPage --> Response404[404 HTML with locale]
```

### File-Based Routing

```
app/
├── [lang]/                         # Dynamic segment for locale
│   ├── layout.tsx                  # Root layout (sets <html lang>)
│   ├── page.tsx                    # Home page
│   ├── projects/
│   │   └── [slug]/
│   │       └── page.tsx            # Case study pages
│   ├── error.tsx                   # Error boundary
│   ├── not-found.tsx               # 404 page
│   ├── [...rest]/
│   │   └── page.tsx                # Catch-all 404 fallback
│   └── opengraph-image.tsx         # Dynamic OG image
├── manifest.ts                     # Web app manifest
├── robots.ts                       # robots.txt
└── sitemap.ts                      # XML sitemap
```

---

## Content & Internationalization

### Content Dictionary Pattern

Every translatable string lives in a **typed dictionary** that both locales must satisfy:

```typescript
// lib/content/types.ts
export type PortfolioContent = {
  locale: Locale;
  site: { name: string; role: string; /* ... */ };
  hero: { headlineLead: string; /* ... */ };
  projects: Project[];
  // ... 20+ top-level keys
};

// lib/content/en.ts
export const content: PortfolioContent = {
  locale: "en",
  site: { name: "Ferdinand Dero Saputra", /* ... */ },
  // ... English translations
};

// lib/content/id.ts
export const content: PortfolioContent = {
  locale: "id",
  site: { name: "Ferdinand Dero Saputra", /* ... */ },
  // ... Indonesian translations
};
```

### Why This Pattern?

1. **Type safety**: TypeScript enforces that both dictionaries have identical shape
2. **No runtime cost**: Content is imported at build time, not fetched
3. **No magic**: No string key lookups, no runtime locale switching
4. **Single-file edits**: Adding Indonesian for a feature means editing one file (`id.ts`)
5. **Compile-time validation**: Missing translations are build errors, not runtime bugs

### Content Retrieval

```typescript
// Server Component
import { getContent } from "@/lib/content";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const content = getContent(lang); // Returns typed PortfolioContent
  return <h1>{content.hero.headlineLead}</h1>;
}
```

### Template Strings

Dynamic content uses the `formatTemplate` helper:

```typescript
const template = "Welcome, {name}! You have {count} messages.";
const result = formatTemplate(template, { name: "Alice", count: "5" });
// → "Welcome, Alice! You have 5 messages."
```

---

## Middleware: Locale Detection

**File**: `middleware.ts`

### Responsibilities

1. Inspect incoming request path
2. If path already has a valid locale (`/en/...`, `/id/...`), pass through
3. If path is unprefixed (`/`, `/projects/atlas`), detect locale and redirect:
   - **Cookie**: Read `NEXT_LOCALE` cookie (user's explicit choice)
   - **Header**: Parse `Accept-Language` with quality values
   - **Fallback**: Default to `en`
4. Validate `X-Forwarded-Host` against trusted hosts to prevent open redirect

### Locale Detection Algorithm

```typescript
function detectLocale(request: NextRequest): Locale {
  // 1. Check cookie
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  // 2. Parse Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    // Parse "en-US,en;q=0.9,id;q=0.8" → sort by quality → match base language
    const detected = resolveLocaleFromAcceptLanguage(acceptLanguage);
    if (detected) return detected;
  }

  // 3. Fallback to default
  return defaultLocale; // "en"
}
```

### Open Redirect Prevention

The middleware constructs absolute redirect URLs by reading `X-Forwarded-Host`, but only if that host is in a **trusted set**:

```typescript
function trustedHosts(): Set<string> {
  return new Set([
    new URL(process.env.NEXT_PUBLIC_SITE_URL).host,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ].filter(Boolean));
}
```

An unknown host in `X-Forwarded-Host` is **dropped**, not echoed.

---

## Static Generation

### Build Output

```bash
npx next build
```

Generates **26 static pages**:
- 2 home pages (`/en`, `/id`)
- 12 case study pages (6 projects × 2 locales)
- 2 OG images per locale × 7 pages = 14 images
- Sitemap, manifest, robots.txt

Every page is a **prerendered HTML file** — no server-side rendering at request time.

### How Static Generation Works

#### 1. Locale Params

```typescript
// app/[lang]/layout.tsx
export const dynamicParams = false; // Only allow predefined params

export function generateStaticParams() {
  return locales.map((lang) => ({ lang })); // [{ lang: "en" }, { lang: "id" }]
}
```

#### 2. Project Params

```typescript
// app/[lang]/projects/[slug]/page.tsx
export function generateStaticParams() {
  const allParams = [];
  for (const locale of locales) {
    const content = getContent(locale);
    for (const project of content.projects) {
      allParams.push({ lang: locale, slug: project.id });
    }
  }
  return allParams;
  // Returns: [{ lang: "en", slug: "fcopier" }, { lang: "id", slug: "fcopier" }, ...]
}
```

#### 3. Metadata Generation

Each page declares its own metadata to avoid layout-level pollution:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const content = getContent(lang);
  
  return {
    title: content.hero.headlineLead,
    alternates: {
      canonical: localizedPath(lang),
      languages: localeAlternates(), // { en: "/en", id: "/id", "x-default": "/en" }
    },
  };
}
```

---

## 3D Scene Architecture

### Component Hierarchy

```
Hero
└─ HeroSceneLoader (Intersection Observer)
   └─ HeroScene (Canvas wrapper)
      ├─ ReliefField (InstancedMesh)
      ├─ DriftingCamera
      ├─ Lights
      └─ PointerPlane (invisible, captures mouse)
```

### Performance Strategy

1. **Lazy load**: Canvas only mounts when hero enters viewport
2. **Unmount on exit**: Canvas unmounts when hero scrolls out (stops render loop)
3. **Single draw call**: 336 instances (24×14 grid) rendered as one `InstancedMesh`
4. **No per-frame allocation**: Matrix reused, cell coords precomputed
5. **Capped DPR**: Device pixel ratio limited to 1.5 (retina = 2×2 = 4× pixels, capped to 1.5×1.5 = 2.25×)
6. **Simple materials**: No shadows, no post-processing, two directional lights

### Wave Mathematics

**File**: `lib/hero-relief.ts`

The relief field animates via two wave functions:

```typescript
// Calm state: slow, broad sine waves
function calmWave(cellX: number, cellY: number, elapsed: number): number {
  return (
    Math.sin(cellX * 5.2 + elapsed * 0.55) * 0.62 +
    Math.sin(cellY * 4.1 - elapsed * 0.4) * 0.38
  );
}

// Idle state: faster, tighter interference pattern
function kineticWave(cellX: number, cellY: number, elapsed: number): number {
  return (
    Math.sin(cellX * 13.0 + elapsed * 1.8) * 0.6 +
    Math.sin((cellX * 0.6 + cellY) * 9.0 - elapsed * 1.2) * 0.4
  );
}
```

After 3 seconds of pointer stillness, the field **cross-fades** from calm to kinetic using a lerp:

```typescript
const wave = calmWave(...) * (1 - idleBlend) + kineticWave(...) * idleBlend;
```

### Pointer Interaction

Cursor position is captured from the R3F state (already normalized to NDC), smoothed via lerp, and creates a **repulsion dent** with exponential falloff:

```typescript
const distance = Math.hypot(cellX - pointerX, cellY - pointerY);
const dent = Math.exp(-distance * distance * 9) * strength * 0.85;
const zValue = wave * amplitude - dent * 0.35;
```

### Theme Integration

The 3D scene reads CSS custom properties to match the active theme:

```typescript
// lib/relief-palette.ts
export function readReliefPalette(): ReliefPalette {
  const styles = getComputedStyle(document.documentElement);
  return {
    cubeColor: styles.getPropertyValue("--relief-cube-color").trim(),
    emissiveColor: styles.getPropertyValue("--relief-emissive-color").trim(),
  };
}
```

A `MutationObserver` watches `[data-theme]` and updates the palette when the user toggles themes.

---

## Progressive Web App (PWA)

### Service Worker Strategy

**File**: `public/sw.js`

The service worker implements a **hybrid caching strategy**:

```javascript
// Navigation requests: Network-first (always fresh content)
if (request.mode === "navigate") {
  return fetch(request).catch(() => caches.match("/offline.html"));
}

// Static assets: Cache-first (fonts, images, scripts)
if (request.destination === "font" || request.destination === "image") {
  return caches.match(request).then(cached => cached || fetch(request));
}
```

### Web Manifest

**File**: `app/manifest.ts`

The manifest is **generated at build time** with locale-specific names:

```typescript
export default function manifest(): MetadataRoute.Manifest {
  const content = getContent("en"); // Default locale for manifest
  return {
    name: content.site.name,
    short_name: content.site.initials,
    start_url: "/en",
    display: "standalone",
    background_color: canvasHex.light,
    theme_color: canvasHex.light,
    icons: [/* PWA icons */],
  };
}
```

### Registration

**Component**: `ServiceWorkerRegistrar`

The service worker registers on first visit and updates on subsequent visits:

```typescript
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").then(registration => {
      registration.update(); // Check for updates
    });
  }
}, []);
```

---

## Metadata & SEO

### Canonical URLs

Every page declares its own canonical to avoid layout-level inheritance polluting 404 pages:

```typescript
// app/[lang]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    alternates: {
      canonical: localizedPath(lang),        // This page's canonical
      languages: localeAlternates(),         // Locale alternates
    },
  };
}
```

### Hreflang Tags

Every page emits `hreflang` tags for all locales plus `x-default`:

```html
<link rel="alternate" hreflang="en" href="https://example.com/en" />
<link rel="alternate" hreflang="id" href="https://example.com/id" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en" />
```

### Open Graph Images

**File**: `app/[lang]/opengraph-image.tsx`

OG images are generated at build time using `@vercel/og`:

```typescript
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const content = getContent(lang);
  
  return new ImageResponse(
    <OGCard name={content.site.name} role={content.site.role} />,
    { width: 1200, height: 630 }
  );
}
```

### Sitemap

**File**: `app/sitemap.ts`

The sitemap includes every static page with its locale alternates:

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  const entries = [];
  
  // Home pages
  for (const locale of locales) {
    entries.push({
      url: `${siteUrl}${localizedPath(locale)}`,
      lastModified: new Date(),
      alternates: { languages: localeAlternates() },
    });
  }
  
  // Case study pages
  for (const locale of locales) {
    const content = getContent(locale);
    for (const project of content.projects) {
      entries.push({
        url: `${siteUrl}${localizedPath(locale, project.href)}`,
        alternates: { languages: localeAlternates(project.href) },
      });
    }
  }
  
  return entries;
}
```

---

## Testing Strategy

### Test Pyramid

```
        /\        E2E (Playwright)
       /  \       ├─ Routing & metadata
      /────\      ├─ Accessibility (axe)
     /      \     ├─ 3D scene rendering
    /  Unit  \    └─ Keyboard navigation
   /──────────\   
  /   (Vitest)  \  ├─ Wave functions
 /───────────────\ ├─ Locale detection
                   └─ Template formatting
```

### E2E Test Suites

**File**: `tests/site.spec.ts`

1. **Routing**: Middleware redirects, locale validation, 404 handling
2. **Metadata**: Canonical, hreflang, sitemap, manifest
3. **Accessibility**: Axe violations, ARIA labels, color contrast
4. **Responsive**: No horizontal overflow at 375px
5. **Keyboard**: Tab order, focus management, skip links

**File**: `tests/proof-3d.spec.ts`

1. WebGL context creation
2. Canvas renders without errors
3. InstancedMesh created with correct count
4. Pointer interaction updates matrix

### Running Tests

```bash
# Install Chromium (once per machine)
pnpm test:install

# Run all tests
pnpm test

# Run specific suite
pnpm test tests/site.spec.ts

# Debug mode (headed browser)
pnpm test --debug
```

---

## Error Handling

### Error Boundaries

**File**: `app/[lang]/error.tsx`

Catches React errors and renders a fallback UI with locale-specific copy:

```typescript
"use client";

export default function Error({ error, reset }: ErrorProps) {
  const locale = useLocaleFromPathname(); // Extract from URL
  const copy = getErrorCopy(locale);
  
  return (
    <div>
      <h1>{copy.title}</h1>
      <p>{copy.message}</p>
      <button onClick={reset}>{copy.retry}</button>
    </div>
  );
}
```

### Not Found Handling

**File**: `app/[lang]/not-found.tsx`

Renders a 404 page with locale-specific copy. Next.js automatically adds `<meta name="robots" content="noindex">` to 404 responses.

**File**: `app/[lang]/[...rest]/page.tsx`

Catch-all route that triggers `notFound()` for any unknown path under a valid locale.

---

## Security

### Content Security Policy

**File**: `next.config.ts`

Strict CSP enforced in production:

```
default-src 'self';
script-src 'self' 'unsafe-inline';  /* Theme bootstrap requires inline */
style-src 'self' 'unsafe-inline';   /* Tailwind requires inline */
img-src 'self' data: blob:;         /* Data URIs for OG images */
font-src 'self';
connect-src 'self';
frame-ancestors 'none';             /* No embedding */
```

### Security Headers

Every response carries:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Input Validation

Middleware validates all dynamic inputs:

- Locale must match `/^[a-z]{2}$/` (two-letter code)
- Host must be in trusted set (no open redirect)
- Paths are normalized before processing

---

## Performance Optimizations

### Code Splitting

1. **Route-based**: Each page is a separate chunk
2. **Component-based**: Heavy components lazy-loaded:
   - `HeroScene` (Three.js)
   - `CertificateLightbox` (modal)
3. **Dynamic imports**: `next/dynamic` with `ssr: false` for client-only components

### Image Optimization

All images use Next.js `<Image>` component:

- Automatic WebP conversion
- Responsive srcset generation
- Lazy loading with Intersection Observer
- Blur placeholder for above-fold images

### Font Loading

Geist fonts loaded via `next/font` with `display: swap`:

```typescript
import { GeistSans } from "geist/font/sans";

export default function Layout({ children }) {
  return (
    <html className={GeistSans.className}>
      {children}
    </html>
  );
}
```

### Animation Performance

All animations follow compositor-only properties:

- Only `transform` and `opacity` (GPU-accelerated)
- `will-change` applied temporarily via transition classes
- `prefers-reduced-motion` removes all animations

---

## Deployment Architecture

### Build Process

```bash
1. pnpm install          # Install dependencies
2. pnpm typecheck        # Verify types
3. pnpm lint             # Verify code style
4. pnpm build            # Generate static pages
   ├─ Compile TypeScript
   ├─ Bundle CSS
   ├─ Generate 26 pages
   ├─ Optimize images
   └─ Create service worker
5. pnpm test             # E2E verification
```

### Hosting

Vercel deployment automatically:

1. Detects Next.js app
2. Runs build command
3. Serves from Edge Network
4. Sets environment variables
5. Enables HTTP/2 and Brotli compression

### Edge Network

All static assets and pages served from Vercel Edge:

- Pages: Cached at edge with stale-while-revalidate
- Assets: Immutable cache (hashed filenames)
- API routes: None (fully static site)

---

## Adding a New Feature

### Checklist

- [ ] Add content to both `lib/content/en.ts` and `lib/content/id.ts`
- [ ] Update `lib/content/types.ts` if adding new content shape
- [ ] Create component in `components/`
- [ ] Add to page layout
- [ ] Write E2E test in `tests/`
- [ ] Update `docs/COMPONENT-GUIDE.md`
- [ ] Verify build: `pnpm run verify`
- [ ] Test both locales manually
- [ ] Check Lighthouse scores

### Example: Adding a Blog

1. **Define content type**:
   ```typescript
   // lib/content/types.ts
   export type BlogPost = {
     id: string;
     title: string;
     date: string;
     excerpt: string;
     content: string;
   };
   ```

2. **Add to dictionaries**:
   ```typescript
   // lib/content/en.ts
   export const content: PortfolioContent = {
     // ...
     blog: {
       heading: "Blog",
       posts: [{ id: "first-post", /* ... */ }],
     },
   };
   ```

3. **Create route**:
   ```typescript
   // app/[lang]/blog/page.tsx
   export default async function BlogPage({ params }) {
     const { lang } = await params;
     const content = getContent(lang);
     return <BlogList posts={content.blog.posts} />;
   }
   ```

4. **Add to sitemap**:
   ```typescript
   // app/sitemap.ts
   for (const locale of locales) {
     const content = getContent(locale);
     for (const post of content.blog.posts) {
       entries.push({
         url: `${siteUrl}${localizedPath(locale, `/blog/${post.id}`)}`,
         alternates: { languages: localeAlternates(`/blog/${post.id}`) },
       });
     }
   }
   ```

5. **Write test**:
   ```typescript
   // tests/blog.spec.ts
   test("blog post renders in both locales", async ({ page }) => {
     await page.goto("/en/blog/first-post");
     await expect(page.locator("h1")).toContainText("First Post");
     
     await page.goto("/id/blog/first-post");
     await expect(page.locator("html")).toHaveAttribute("lang", "id");
   });
   ```

---

## Troubleshooting

### Build fails with "Page could not be found"

**Cause**: `dynamicParams = true` allows runtime params, but static export requires all params at build time.

**Fix**: Verify `generateStaticParams()` returns all possible param combinations.

### Middleware redirect loop

**Cause**: Middleware redirects to itself because locale detection returns the same locale repeatedly.

**Fix**: Ensure middleware only runs for unprefixed paths:

```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest).*)",
  ],
};
```

### 3D scene doesn't render

**Cause**: WebGL context creation failed (GPU blacklisted, browser doesn't support WebGL2).

**Fix**: Add fallback in `HeroSceneLoader`:

```typescript
if (!canvas.getContext("webgl2")) {
  return <StaticHeroFallback />;
}
```

### Type error: Property doesn't exist on `PortfolioContent`

**Cause**: Content added to one dictionary but not the other.

**Fix**: Update both `en.ts` and `id.ts` to satisfy the interface.

---

## Further Reading

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Three.js Fundamentals](https://threejs.org/manual/#en/fundamentals)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
