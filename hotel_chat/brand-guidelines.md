# Sona brand — visual guidelines for the hotel chat MVP

**Date:** 2026-08-18 · **Purpose:** codify Sona's brand identity into reusable rules + tokens that feed (1) the session-2 static HTML mockups and (2) the eventual React/Vite frontend. Companion artifact: [`brand/sona-brand.css`](brand/sona-brand.css) — the single shared stylesheet encoding these tokens.

**Sources examined:** all core pages of www.sona.ai (home, About, Pricing, Careers, products: employee-app / scheduling / HR / payroll / ATS / LMS / forecasting / reporting / Raffy AI, industries: hospitality / hotels / care / retail / logistics), the four theme CSS bundles behind the site (`template_theme-overrides`, `template_main`, `template_sona-tailwind-*`), the OG/social share image, product-UI illustration assets, and funding-announcement blog posts. Sona publishes **no standalone press kit**; the marketing site is the de-facto brand reference.

## 1. Brand in one paragraph

Sona ("AI for better workforce decisions", founded 2021, backed by Google's AI fund) presents as **calm, technical, and warm at once**: warm off-white "stone" surfaces and photography of real frontline staff, paired with precise engineering cues — a monospace label system, hairline borders, restrained shadows — and confident near-black headlines. Color is used sparingly and semantically: lime green = action/success/energy, sky blue = information/scheduling, deep navy = authority (primary buttons, dark sections), teal-green = the brand accent thread. The overall effect: enterprise software that respects frontline workers.

## 2. Logo

- Wordmark: **"Sona."** — lowercase-style geometric sans (Sora), near-black, with a trailing dot. White variant on dark surfaces (`logo-white-*.svg` in their asset CDN).
- Used small and quiet (header height 81px); never oversized or decorated.
- For our MVP: product name TBD (session 2); whatever it is, follow the same treatment — wordmark in Sora SemiBold, near-black on stone, white on navy.

## 3. Typography

Both faces are free Google Fonts — nothing licensed to work around.

| Role                        | Face              | Usage rules observed                                                                                                                                                                                              |
| --------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary — all UI & headings | **Sora**          | Headings 600 (semibold; occasionally 700 for display), `tracking-tight` (−0.025em), line-height 1.1–1.3. Body 400 at 16–18px (`clamp(1rem, .5vw + .8rem, 1.125rem)`), line-height 1.6. UI labels 500/600 at 14px. |
| Secondary — labels & data   | **IBM Plex Mono** | Uppercase eyebrow labels with wide tracking (0.15em), category tags, numbered markers (`01`, `02`), stat figures, button labels inside product-UI cards.                                                          |

Heading scale in practice (mobile → desktop): h1 40→68px, h2 30→44px, h3 20–24px, all Sora 600 tracking-tight, color near-black (`#0f172a` on light, white on dark).

**The eyebrow idiom** (Sona's most distinctive typographic signature): a small diamond ◆ in the accent color + IBM Plex Mono uppercase, 12–14px, letter-spaced, in the same accent — placed above headings and card titles. E.g. `◆ AI WORKFORCE MANAGEMENT`.

## 4. Color

Sona runs a shadcn-style HSL token system over Tailwind's **stone** (warm gray) and **lime** ramps, plus custom brand colors.

### Core tokens

| Token                | Value                             | Role                                                           |
| -------------------- | --------------------------------- | -------------------------------------------------------------- |
| `--background`       | `#fafaf9` (stone-50)              | Page background — warm off-white, never pure white pages       |
| `--foreground`       | `#1c1917` (stone-900)             | Default text                                                   |
| `--sona-dark`        | `#0f172a` (slate-900)             | Headlines, primary buttons, dark sections                      |
| `--primary`          | `#12876c` (hsl 166 76% 30%)       | Brand teal-green — accent text, eyebrows, links, active states |
| `--sona-accent`      | `#3b82f6`                         | Blue — button hover state, interactive accents                 |
| `--border`           | `#e2e0df` / `#e7e5e4` (stone-200) | Hairline 1px borders everywhere                                |
| `--muted`            | `#f5f5f4` (stone-100)             | Muted surfaces, secondary-button hover                         |
| `--muted-foreground` | `#65758b` (slate-ish)             | Secondary text; also stone-500 `#78716c`, stone-600 `#57534e`  |

### Accent ramps (used semantically, not decoratively)

- **Lime** (energy / action / success / highlight): 50 `#f7fee7` · 100 `#ecfccb` · 200 `#d9f99d` (tinted panels, highlight blocks) · 400 `#a3e635` · 500 `#84cc16` (CTA buttons) · 600 `#65a30d` (success text, buttons on white)
- **Sky blue** (information / scheduling in product illustrations): tints around `#bae6fd`–`#38bdf8`, saturated button `#3b82f6`
- **Deep teal/navy section backgrounds:** `#072a38`, `#021b25` (marketing dark sections; text white at 50–80% opacity)
- **Coral** `#ef6b51`: rare warm accent — use sparingly if at all
- **Teal-600** `#0d9488`: occasional alternative accent

### Usage rules observed

- Backgrounds are stone, never cold gray or pure white full-pages; white (`#fff`) is reserved for **cards** sitting on stone or tinted panels.
- Lime never carries white text — always near-black (`#1c1917`) on lime.
- The teal-green `--primary` is a *text/accent* color (135+ uses as `text-primary` vs 3 as `bg-primary`) — not a button fill.
- Primary buttons are **dark navy** filled, hover shifts to **blue** (`#3b82f6`); marketing hero CTAs also come lime-filled with dark text.
- Category color-coding in product UI: each domain gets a tint + saturated pair (scheduling = sky, HR/engagement = lime, …). For our app this maps naturally to e.g. official channels vs organic chats.

## 5. Layout patterns

- **Containers:** content max-width **1400px**, page edge max **1800px**; gutters `1.5rem` mobile → `4rem` ≥768px.
- **Header:** fixed, **81px**, stone-50 background, 1px stone-200 bottom border. Dark compact CTA button at right.
- **Radii:** default **8px** (`rounded-lg`, 187 uses on the homepage alone) for buttons, inputs, cards; 12–24px for large panels/illustration cards; full-round only for avatars/pills.
- **Borders over shadows:** 1px stone-200 borders define surfaces; shadows are subtle and reserved for hover (`0 4px 6px -1px rgba(0,0,0,.1)`) — no heavy drop shadows.
- **Bento grids:** marketing uses collages of white cards + tinted panels + photography at mixed sizes; cards frequently pair a tinted header zone with white body.
- **Photo treatment:** authentic frontline staff photography (baristas, housekeepers, storefronts), often under `bg-gradient-to-t from-black/60 to-transparent` overlays with white text.
- **Spacing rhythm:** generous vertical whitespace between sections; inside cards, 1rem–1.5rem padding; body paragraphs separated by 1rem.

## 6. Component idioms (as encoded in `brand/sona-brand.css`)

- **Buttons:** inline-flex, 8px radius, `.75rem 1.5rem` padding, Sora 600, `transition all .2s`. Variants: **primary** navy→blue hover, white text; **secondary** transparent with navy border → stone-100 hover; **lime** lime-500/400 with near-black text (hero CTAs). Arrows (→ / ↗) as trailing affordance.
- **Eyebrow label:** `◆ LABEL` — Plex Mono, 12px, uppercase, 0.15em tracking, accent color (primary green by default; category color inside cards).
- **Cards:** white, 1px stone-200 border, 8–16px radius, optional tinted band; title Sora 600, meta text mono.
- **Pills/badges:** small rounded-full, tinted background + darker same-hue text (e.g. lime-100 bg + lime-700 text).
- **Dark sections:** navy `#0f172a`–`#072a38`, white headings, body white at 60%, lime or white accents.

## 7. Feeding the next stages

- **Session 2 (static HTML mockups):** every mockup page links the shared [`brand/sona-brand.css`](brand/sona-brand.css) (tokens + base + component classes) and inlines only page-specific layout styles. This keeps all pages on one visual system and makes divergence a deliberate act.
- **Implementation (already decided by Oleksii):** TypeScript + **React** for views, **TanStack DB** for the local data model, **Vite** build, **vitest** tests. The brand CSS carries over as the global stylesheet: components consume the same custom properties (`var(--sona-*)`) rather than redefining colors, so mockups and the real app share one source of truth. Google Fonts (Sora, IBM Plex Mono) via `<link>` in mockups; self-host via Fontsource in the app.
- **App-specific translation suggestions** (decisions for the mockup session, not made here): stone-50 app background with white chat surfaces; navy for primary actions and own-message emphasis; the eyebrow idiom for section headers ("📌 OFFICIAL" in mono); lime tint as the *official channel* signature vs plain white organic chats — echoing Sona's category color-coding; mono for timestamps and system messages.

## Open items

- Product wordmark/name — session 2.
- Dark mode: Sona's site is light-only; MVP mockups should stay light-only.
- Accessibility check to carry into mockups: lime buttons need near-black text (per brand rule); primary green `#12876c` on white passes AA for normal text (~4.9:1); muted grays on stone must stay ≥ stone-500 for body-size text.
