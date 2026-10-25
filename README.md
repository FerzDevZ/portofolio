# Portfolio — Ferdinand Dero Saputra

A bilingual (EN/ID) portfolio site built with Next.js 15 App Router, React 19, and Tailwind CSS v4. Every page is statically generated with zero runtime i18n dependencies.

## Features

- **Locale-first architecture**: `/en` and `/id` routes with middleware-based language detection
- **Fully static**: all pages prerendered at build time, zero dynamic routes
- **Dual-language**: Complete English and Indonesian dictionaries without machine translation (`ja` is a registered skeleton awaiting translation)
- **Blog**: MDX articles per locale (`content/blog/slug.<locale>.mdx`) with GFM, syntax highlighting, and an RSS feed per locale
- **Contact form**: Server Action with Zod validation, Upstash-backed rate limiting, and Resend email delivery
- **Resume**: Print-optimized `/resume` page plus `GET /api/resume` PDF export (Puppeteer + serverless Chromium)
- **3D hero scene**: Interactive Three.js relief field with pointer interaction and idle animations
- **Progressive Web App**: Service worker, web manifest, offline support
- **Accessibility**: WCAG AA compliant, tested with axe-core in both themes, keyboard navigation, screen reader support
- **Performance**: Lighthouse 100 scores, optimized animations, lazy-loaded 3D canvas
- **SEO**: Per-locale metadata, hreflang tags, Open Graph images, XML sitemap

## Quick Start

```bash
# Install dependencies
pnpm install

# Development server (http://localhost:3000 → redirects to /en)
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Production build (26 static pages)
pnpm build

# Preview production build
pnpm start

# Run all verification gates
pnpm run verify
```

## Prerequisites

- **Node.js**: ≥22.0.0
- **Package manager**: pnpm 11.21.0 (specified via `packageManager` field)

## Project Structure

```
portofolio/
├── app/
│   ├── [lang]/                    # Locale-prefixed routes
│   │   ├── layout.tsx             # Root layout with <html lang>
│   │   ├── page.tsx               # Home page
│   │   ├── projects/[slug]/       # Case study pages
│   │   ├── blog/                  # Blog index + MDX article pages
│   │   ├── contact/page.tsx       # Contact page (server-action form)
│   │   ├── resume/page.tsx        # Print-optimized résumé document
│   │   ├── feed.xml/route.ts      # Per-locale RSS feed
│   │   ├── error.tsx              # Error boundary
│   │   ├── not-found.tsx          # 404 page
│   │   └── opengraph-image.tsx    # Dynamic OG image per locale
│   ├── actions/contact.ts         # "use server" contact form action
│   ├── api/resume/route.ts        # PDF export via Puppeteer
│   ├── globals.css                # Tailwind v4 styles + CSS custom properties
│   ├── manifest.ts                # Web app manifest generator
│   ├── robots.ts                  # robots.txt generator
│   └── sitemap.ts                 # XML sitemap generator
├── components/
│   ├── header.tsx                 # Navigation with scroll tracking
│   ├── hero.tsx                   # Hero section with 3D scene loader
│   ├── hero-scene.tsx             # Three.js relief field
│   ├── hero-scene-loader.tsx      # Intersection observer loader
│   ├── work.tsx                   # Projects grid
│   ├── capabilities.tsx           # Skills section
│   ├── certificates.tsx           # Certificates with lightbox
│   ├── certificate-lightbox.tsx   # Modal with focus trap
│   ├── contact.tsx                # Contact section
│   ├── theme-toggle.tsx           # Light/dark theme switcher
│   ├── language-switch.tsx        # EN/ID language selector
│   ├── motion-toggle.tsx          # Animation preferences toggle
│   └── ...                        # Utility components
├── lib/
│   ├── content/
│   │   ├── types.ts               # TypeScript interfaces for content
│   │   ├── en.ts                  # English dictionary
│   │   ├── id.ts                  # Indonesian dictionary
│   │   ├── index.ts               # Content barrel export
│   │   └── error-copy.ts          # Error boundary copy
│   ├── locale.ts                  # Locale utilities and Accept-Language parser
│   ├── blog.ts                    # MDX frontmatter loader (slug.<locale>.mdx)
│   ├── hero-relief.ts             # 3D wave mathematics
│   ├── relief-palette.ts          # Theme-aware 3D scene colors
│   └── brand.ts                   # Brand tokens shared with manifest
├── content/blog/                  # MDX articles (slug.en.mdx, slug.id.mdx)
├── middleware.ts                  # Locale detection and redirect
├── public/
│   ├── sw.js                      # Service worker (offline shell)
│   └── ...                        # Static assets
├── tests/
│   ├── site.spec.ts               # Routing, metadata, accessibility
│   ├── proof-3d.spec.ts           # 3D scene rendering verification
│   └── ...                        # Additional test suites
└── docs/
    ├── ARCHITECTURE.md            # System design documentation
    ├── COMPONENT-GUIDE.md         # Component API reference
    └── roadmap-ui-ux.md           # Feature roadmap
```

## Technology Stack

### Core
- **Next.js 15**: App Router with React Server Components
- **React 19**: Latest React with improved Suspense and error handling
- **TypeScript 5.7**: Strict mode, no implicit any
- **Tailwind CSS v4**: Modern CSS with `@theme` and OKLCH colors

### 3D Graphics
- **Three.js 0.186**: WebGL rendering
- **@react-three/fiber 9.8**: React renderer for Three.js

### Development
- **ESLint**: Next.js recommended config
- **Playwright 1.64**: E2E testing with axe-core accessibility audits
- **pnpm**: Fast, disk-space efficient package manager

## Build & Verification Gates

Every change must pass these gates before being considered complete:

```bash
# Gate 1: Type safety
npx tsc --noEmit      # Must exit with code 0, zero type errors

# Gate 2: Static build
npx next build        # Must exit with code 0, all 26 pages static

# Gate 3: E2E tests
pnpm run test         # Routing, metadata, accessibility, 3D scene

# Gate 4 (CI only): Lighthouse
npx @lhci/cli@0.15.1 autorun --config=lighthouserc.json
```

> **Important**: Run `next build` only when the dev server is stopped. Both use the same `.next` directory.

## Internationalization (i18n)

This portfolio implements **locale-first routing** without any i18n library:

1. **URL structure**: Every page lives under `/en` or `/id`
2. **Content dictionaries**: `lib/content/en.ts` and `lib/content/id.ts` define every translatable string
3. **Type safety**: Both dictionaries satisfy the same `PortfolioContent` interface
4. **Middleware**: `middleware.ts` redirects unprefixed URLs (`/`) to a locale based on:
   - `NEXT_LOCALE` cookie (user preference)
   - `Accept-Language` header (browser preference)
   - Default fallback (`en`)
5. **Static generation**: All pages are prerendered at build time — no runtime locale detection

### Adding a new locale

Adding a locale is a cross-file change with **two locale sets** in `lib/locale.ts`:

1. Register the dictionary in the type universe:
   ```typescript
   export const locales = ["en", "id", "fr"] as const;
   ```
   This is a compile error everywhere until every `Record<Locale, …>` mapping
   gains the new key — the dictionary barrel (`lib/content/index.ts`), the
   error copy, and the 404 boundary.

2. Create `lib/content/fr.ts` implementing `PortfolioContent` and register it
   in `lib/content/index.ts`.

3. **Ship it last**: move the locale into the routing set. Nothing renders,
   gets linked, or is advertised to crawlers until this line changes:
   ```typescript
   export const publishedLocales = ["en", "id", "fr"] as const satisfies readonly Locale[];
   ```
   A locale with a dictionary but no `publishedLocales` entry has no routes —
   `ja` currently sits in exactly that state.

Once published, `generateStaticParams`, `hreflang`, the sitemap, and the
middleware accept the locale automatically. Run `pnpm run typecheck` before
considering the locale ready.

## Design System

### Colors (OKLCH)
- **Light theme**: Warm neutrals with OKLCH for perceptual uniformity
- **Dark theme**: Deep blues with subtle chroma on neutrals
- **Accent**: Theme-aware, maintains contrast ratios in both modes

### Typography
- **Sans**: Geist Sans (400, 500, 600)
- **Mono**: Geist Mono (for code)
- **Fluid scaling**: `clamp()` for responsive type without breakpoints

### Animation Principles
- Only `transform` and `opacity` (compositor-friendly)
- Explicit transition properties (no `transition-all`)
- `prefers-reduced-motion` disables all animations
- Hover effects gated by `@media (hover: hover)` (no false positives on touch)

### Component States
Buttons and interactive cards implement 8 discrete states:
1. Default
2. Hover
3. Active (pressed)
4. Focus-visible
5. Disabled
6. Hover + focus
7. Active + focus
8. Reduced motion variant

### Accessibility
- Minimum 24×24px touch targets
- Skip link to main content
- Focus management for modals and drawers
- Keyboard navigation for all interactive elements
- `aria-live` regions for dynamic content
- Semantic HTML5 landmarks

## 3D Hero Scene

The hero section features an interactive **relief field** — a grid of 336 instanced boxes (24×14) that:

- **Wave animation**: Dual-phase sine wave creates a breathing surface
- **Pointer interaction**: Cursor creates a repulsion dent with exponential falloff
- **Idle state**: After 3 seconds of stillness, switches to higher-frequency interference pattern
- **Performance**: Single draw call, capped at 1.5 DPR, runs only while hero is on-screen

The mathematics live in `lib/hero-relief.ts` and are unit-tested as pure functions.

## Testing Strategy

### E2E Tests (Playwright)
- **Routing**: Locale detection, middleware redirects, 404 handling
- **Metadata**: Canonical URLs, hreflang tags, Open Graph images
- **Accessibility**: Axe-core audits on every major page
- **3D Scene**: WebGL context creation, instanced mesh rendering
- **Keyboard**: Tab navigation, focus management, lightbox traps
- **Responsive**: No horizontal overflow at 375px viewport

### Test Suites
```bash
pnpm test:unit         # Vitest unit tests (lib/*.test.ts)
pnpm test              # All Playwright tests (against the production build)
pnpm test:install      # Install Chromium (once per machine)
```

Tests run against the built output (`pnpm build` → `pnpm start` → Playwright).

## Content Guidelines

### Project Requirements
Every project in the portfolio must have:
- ✅ Public GitHub repository
- ✅ Verifiable metrics from repo data (commits, file count, no invented numbers)
- ✅ Case study with context, approach, outcome, and metrics
- ⚠️ Screenshot (only FCopier currently has one)

### What's Missing
Content gaps documented in the current README:
- Formal work history (if owner wishes to publish)
- Downloadable CV link
- Project screenshots (5 of 6 projects missing)

See `docs/roadmap-ui-ux.md` for P0 features.

## Performance Budget

- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Total Blocking Time**: <200ms
- **Cumulative Layout Shift**: <0.1
- **Speed Index**: <3.0s

Lighthouse thresholds enforced in `lighthouserc.json` and CI.

## Service Worker

The PWA shell (`public/sw.js`) implements:
- **Network-first** for navigation (always fresh content)
- **Cache-first** for static assets (fonts, images, scripts)
- **Offline fallback** for when network is unavailable

The service worker is registered via `ServiceWorkerRegistrar` component.

## Environment Variables

```bash
# Production site URL (required for canonical URLs and sitemap)
NEXT_PUBLIC_SITE_URL=https://portofolio-one-xi-42.vercel.app

# Vercel auto-sets these (used by middleware for trusted host validation)
VERCEL_PROJECT_PRODUCTION_URL=portofolio-one-xi-42.vercel.app
VERCEL_URL=<preview-deployment>.vercel.app
```

## Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Set `NEXT_PUBLIC_SITE_URL` in environment variables
3. Build command: `pnpm build`
4. Output directory: `.next`

### Self-Hosted
```bash
pnpm build
pnpm start  # Runs Next.js standalone server on port 3000
```

### Static Export
This site uses middleware for locale detection, so static export (`output: 'export'`) is **not supported**. The build output is statically generated pages served by the Next.js runtime.

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. **Verify**: Type check → Lint → Build → Playwright tests
2. **Lighthouse**: Performance audits (after verify passes)

Runs on every push and pull request.

## Contributing

### Adding a new component
1. Create `components/component-name.tsx`
2. Export props interface: `export type ComponentNameProps = { ... }`
3. Add JSDoc comments for non-obvious behavior
4. Update `docs/COMPONENT-GUIDE.md`

### Adding a new page
1. Add content to both `lib/content/en.ts` and `lib/content/id.ts`
2. Create page component in `app/[lang]/path/page.tsx`
3. Declare metadata with `hreflang` alternates
4. Add E2E test in `tests/`

### Code Style
- **TypeScript**: Strict mode, explicit return types for exported functions
- **React**: Function components, hooks, no class components
- **Comments**: Explain *why*, not *what* (code should be self-documenting)
- **Naming**: Intention-revealing, no abbreviations except standard ones (URL, ID, OG)

## License

This is a personal portfolio. Code structure and patterns are MIT licensed. Content (text, images, project descriptions) remains proprietary.

## Support

For questions about the architecture or implementation, see:
- `docs/ARCHITECTURE.md` — System design and routing flow
- `docs/COMPONENT-GUIDE.md` — Component API reference
- `MEMORY.md` — Failure post-mortems and learned invariants
