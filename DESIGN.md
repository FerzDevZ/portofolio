# DESIGN.md — Ferdinand Dero Saputra

> The visual contract for this portfolio. It records what the code already does;
> it is not an aspiration. A change that contradicts this file is a design
> decision, and it has to land here first.
>
> Verified against `app/globals.css`, `lib/content/*.ts`, and the component tree
> on 2026-11-17.

---

## 1. Identity

**Night studio / day print.** The site is a printed specimen sheet at night and a
warm paper proof by day: the same editorial grid, the same ink, two light
sources. It is not "a dark-mode SaaS page" — dark is the studio, light is the
sheet, and both are first-class.

- **Subject**: one frontend engineer, his shipped work, and the evidence around it.
- **Emotional register**: restraint, precision, quiet confidence. No hype, no
  sparkle, no sales pressure.
- **Reference school**: Swiss editorial numbering and grids, Vercel/Linear control
  density, print typography (hairlines, marginalia, mono metadata).

### Dials (1–10)

| Dial | Value | What it buys |
|---|---|---|
| Density | **4** | Generous section rhythm (`py-10` rows, `8rem` hero top space), wide gutters. The page is read, not scanned. |
| Boldness | **7** | Display type to `5.25rem` at `-0.04em` tracking. Headlines carry the page; decoration does not. |
| Temperature | **3 dark / 7 light** | Dark neutrals sit on hue 258 (cool ink); light is hue 85 (warm paper). Temperature is a theme dimension, not a single brand choice. |
| Polish | **8** | Explicit 8-state controls, compositor-only motion, reduced-motion honoured, per-theme contrast measured rather than assumed. |

---

## 2. Colour

Every colour is a token in `app/globals.css` `@theme`. **No component may name a
raw colour**, with two documented exceptions: the global error boundary (it ships
its own inline styles because it must render when the stylesheet did not) and the
Three.js fallback fill light (WebGL cannot read CSS variables).

### Roles

| Token family | Role | Rule |
|---|---|---|
| `canvas` / `panel` / `raised` | Surfaces | Three steps only. Never invent a fourth. |
| `line` / `line-strong` / `control-line` | Hairlines vs control outlines | Dividers may be faint; **control boundaries carry a 3:1 floor** (`control-line`). |
| `ink` / `ink-muted` / `ink-faint` | Text ramp | `ink-faint` is never used below 11px, and never for body copy. |
| `accent` (hue 248) | The one accent | Links, focus rings, the featured marker. Footprint under 5% of any viewport. |
| `live` (hue 158) | Availability status | The dot and its label **only**. Never decoration. |
| `signal` (hue 75) | Failure | Form errors and the offline chip **only**. |
| `veil*` / `glare` / `shadow*` | Depth | Alpha stacks, hue-matched to the canvas — never pure black. |

The light palette is written twice on purpose (the no-script media block and the
`[data-theme="light"]` block). **A palette change lands in both**, and any token
promoted to small text is re-measured (`tests/site.spec.ts` theme-contrast
tests sample the painted canvas, not the declared value).

---

## 3. Type

Geist Sans for reading, Geist Mono for metadata: indices, periods, stack names,
timestamps, labels. Mono is a *register*, not decoration — if a string is not
machine data or a section index, it is not mono.

| Token | Use |
|---|---|
| `--text-display` | The H1 only, once per page. |
| `--text-title` | Page titles below the home hero (blog index, case study). |
| `--text-section` | Section headings. Deliberately below `title` so evidence never outranks the claim. |
| `--text-lede` | One deck paragraph per section. |
| `--text-row` | Work and certificate row titles. |
| `--text-email` | The contact address, with its own scale so the local part never breaks mid-word. |

All scales use `clamp()`; there are no breakpoint-specific font sizes. Measure is
capped (`max-w-xl` / `max-w-3xl`) so prose stays under ~70 characters.

---

## 4. Layout archetypes

1. **Asymmetric hero** — 8/12 display column, 4/12 meta rail, stack strip pinned
   to the hairline below. Never a centered column.
2. **Featured diptych** — 7/5: narrative on the left, the metric diorama on the
   right.
3. **Editorial list rows** — one project/certificate per row, full-width, ruled.
   Not a card grid, not equal thirds.
4. **Numbered sections** — `01 —`, `02 —` in mono. The numbering is the
   navigation model; it is why the em dash survives in headings while it is
   avoided in prose.
5. **Marginalia** — labels and periods sit off the reading axis, in mono, faint.

Grid: single column below `lg`; 12 columns at `lg` and above. Nothing scrolls
sideways at 320px (enforced by `noHorizontalOverflow`).

---

## 5. Motion

- **Properties**: `transform`, `opacity`, `background-size`, and colour only.
  `transition-all` and uniform `hover:scale-*` are forbidden.
- **Easing**: `cubic-bezier(0.22, 0.7, 0.3, 1)` for entrances, 150–320ms.
- **Entrances** are opacity + 14–22px rise, staged by priority (`60ms` →
  `340ms`), and they exist to order attention, not to decorate.
- **The 3D relief** is a layer, never a container: it loads only on hover+fine
  pointer, non-reduced-motion, >2 cores, after idle; it unmounts off-screen; the
  CSS poster is the floor and the only thing a weak device ever sees.
- **Reduced motion** removes the work instead of shortening it (scroll timelines
  are deleted, not set to `0.01ms`).

---

## 6. Content rules

- Copy lives in `lib/content/{en,id,ja}.ts`. A string in a component is a bug.
- Numbers shown to a visitor must be traceable to the repository they describe;
  no invented metrics, testimonials, or logo walls.
- Section labels, nav items, and page links are locale-free paths; every href is
  built with `localizedPath`.
- `ja` is a translated skeleton and has no routes until it is complete.

---

## 7. Forbidden (repo-specific)

| Never | Why |
|---|---|
| Violet/indigo gradients, `bg-clip-text`, neon glow | Not this identity; the accent is one blue used sparingly. |
| Centered hero, three equal cards, alternating-background sections | The editorial grid is the layout argument. |
| Emoji as icons, Lucide-everything | Icons are inline SVG, drawn for their one job. |
| Extra accent orbs / radial blobs | The only allowed glow is the specular light inside the metric diorama, which follows the 3D plane. |
| Copy invented in JSX, `lang === "en" ? … : …` | The dictionary is the single source. |
| `transition-all`, `hover:scale-105`, `any`, `TODO`, `...` stubs | Gates, not preferences. |

---

## 8. Verification

```bash
pnpm run typecheck   # 0 diagnostics
pnpm run lint        # 0 errors, 0 warnings
pnpm run test:unit   # lib invariants
pnpm run build       # static pages only
pnpm run test        # Playwright: routing, metadata, axe, contrast, 3D, motion
```

A design change is not done until the axe and theme-contrast tests pass in both
themes at 320px and desktop width.
