# Perfume Hut

Storefront for **Perfume Hut** ([perfumehut.co](https://perfumehut.co)), a multi-brand designer
fragrance store. The home page opens on the Perfume Hut wordmark, then a scroll-driven virtual
tour: a gallery wall of framed bottles beside an arched doorway onto a parfumerie shopfront.
Scrolling opens the arch, "Welcome to Perfume Hut" appears over the facade, and you walk through
the window into a marble boutique, built in CSS 3D, with a lit display case for every house
down both walls. The lights come up as you arrive, and scrolling walks you from case to case,
each seen at a three-quarter angle with a placard beside it. Stepping inside a case opens a room
where its glass doors swing open onto the bottles.

Ava, an AI fragrance advisor who guides the walk and recommends a bottle, is built but switched
off for now: set `flags.ava` in `src/lib/flags.ts` to `true` to bring her back everywhere.

## Stack

| Concern   | Choice                                                                                    |
| --------- | ----------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19.3                                            |
| Language  | TypeScript (strict, `noUncheckedIndexedAccess`, typed routes)                             |
| Styling   | CSS Modules + design tokens in `src/app/globals.css`, no runtime CSS-in-JS                |
| Motion    | CSS transitions & scroll-driven animations, Motion for the tour, React `<ViewTransition>` |
| Fonts     | `next/font/google`: Marcellus (display), Inter Tight (UI), self-hosted                    |
| Images    | `next/image`, static imports (AVIF/WebP, responsive `sizes`, blur-up)                     |
| Quality   | ESLint (`eslint-config-next` + Prettier), Vitest, Prettier                                |

## Getting started

Requires Node.js 22.12+ (see `.nvmrc`).

```bash
npm install
cp .env.example .env.local   # optional: NEXT_PUBLIC_SITE_URL (defaults to https://perfumehut.co)
npm run dev                  # http://localhost:3000
```

| Script              | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Development server                              |
| `npm run build`     | Production build                                |
| `npm run start`     | Serve the production build                      |
| `npm run lint`      | ESLint                                          |
| `npm run typecheck` | Generate route types, then `tsc --noEmit`       |
| `npm run test`      | Unit tests (Vitest)                             |
| `npm run check`     | Lint, typecheck, test and format check (for CI) |

## Pages

| Route                                             | Rendering | Notes                                                   |
| ------------------------------------------------- | --------- | ------------------------------------------------------- |
| `/`                                               | Static    | Virtual tour, brand marquee, why-us, notes, bestsellers |
| `/shop`                                           | Dynamic   | Filters (for / family / house) and sort via URL params  |
| `/brands`                                         | Static    | Store directory ("the aisles")                          |
| `/brands/[slug]`                                  | SSG       | An aisle: hero, story, shelf, previous/next aisle       |
| `/products/[slug]`                                | SSG       | Size selector, add to bag, notes pyramid, related       |
| `/bag`                                            | Static    | Client bag; checkout CTA disabled until payments exist  |
| `/search`                                         | Dynamic   | Searches house, name, family, audience and notes        |
| `/about`, `/contact`, `/faq`, `/shipping-returns` | Static    | Contact form uses a server action                       |

## Project structure

```
src/
  app/                  Routes, layout, server actions, metadata files (icons, OG, sitemap, robots)
  assets/images/        Photography (see CREDITS.json), imported statically
  components/
    tour/               StoreTour (scroll stage), Entrance (gallery wall + shopfront arch),
                        Gallery (the 3D store floor), CabinetBox (a display case in 3D),
                        Placard, CabinetRoom; Ava (off): AvaGuide, AvaConversation,
                        AvaFigure (poses + lips), AvaSubtitles
    home/               Hero (wordmark) and the store-floor sections below the tour
    product/ brand/     Cards, grids, purchase panel, notes pyramid, aisle hero/nav
    cart/               Bag drawer, lines, summary, header button
    layout/ ui/ seo/    Header, footer, menus, primitives, JSON-LD
  content/              All copy, links and editorial choices, typed
  data/                 Brands and products (sample catalogue)
  lib/                  Catalogue queries, shop filters, search, cart, money, validation, JSON-LD,
                        feature flags (flags.ts)
```

## Motion principles

Motion follows Emil Kowalski's design-engineering guidelines:

- **Only `transform` and `opacity` animate**; Motion values use full transform strings so the
  compositor does the work. Settled states reset to `transform: none` so text stays crisp.
- **Custom curves** (`--ease-out`, `--ease-in-out`, `--ease-drawer`), never `ease-in`.
- **UI is fast** (150–300 ms); storytelling moments (the tour, the aisle walk-in) can be longer.
- **Enter slower than exit** (bag drawer 460 ms in / 280 ms out; placards blur in, fade out fast).
- **Interruptible**: dropdowns, accordions, size selector and drawer use CSS transitions.
- **Press feedback** (`scale(0.97)`) on everything pressable; hover effects only on
  `(hover: hover) and (pointer: fine)`.
- **Reduced motion means gentler, not none**: the tour becomes a static scene with every case
  on one wall (still in perspective), reveals and marquee stop, transitions fall back to fades.

How the pieces fit:

- **Tour** (`components/tour`, `lib/tour-plan.ts`): a pinned 100svh stage over a long scroll
  track. Scroll (lightly spring-smoothed) opens the doorway's clip, shows the welcome over the
  shopfront and walks the camera through its window. The store floor is CSS 3D, laid out in
  the stage's container units: marble walls, a coffered ceiling with lit coves, three
  chandeliers, a dark marble runner, and a feature wall standing proud of the back wall with a
  spotlit bottle on a podium. Each case has a downlight, a scallop of light on the wall above
  it, light spilling onto the floor and a contact shadow. The lights come up case by case as
  you arrive, the case you're at gets a sweep of light across its glass, and on a mouse the
  camera glances a little towards the pointer. `tour-plan.ts` holds the geometry and the walk
  as plain, tested numbers: where the camera stands for each stop (a three-quarter view, the
  case on the opposite side from its placard), how long each stop and move takes, and which
  stop you're at. Stops are scroll-snap points, so scrolling settles on them; "Skip the tour"
  jumps past. Keyboard focus on a case walks you to it. With reduced motion the floor is one
  still wall of cases.
- **Feature flags** (`lib/flags.ts`): `ava` switches the advisor on or off everywhere. While
  she's off, placards speak for each stop on the floor and a house panel stands beside the
  open case; all of her code and assets stay in place.
- **Ava** (switched off; `lib/ava.ts`, `lib/ava-speech.ts`, `data/ava-poses.ts`, `content/home.ts`): eight
  poses from one photo shoot, aligned on a shared canvas so her head stays put as she changes
  gesture; she's mirrored to face whatever she's presenting and walks between stops. She
  talks rather than chats: each line is planned into film-style subtitle cues (balanced, never
  more than two short lines) and a matching mouth track; `AvaFigure` swaps mouth frames —
  warped offline from each pose — exactly over her lips, and `AvaSubtitles` shows the words with a replay
  control (screen readers get the whole line at once). With reduced motion the lips stay
  still and the subtitles still advance. This is the seam where a voiced AI avatar plugs
  in: swap the planned timings for ones from real audio. The guided pick is plain, tested
  logic: who it's for (unisex suits everyone), then a fragrance family from those on the
  shelves, then a bestseller that fits, widening the search when nothing matches exactly.
- **Cases** (`CabinetBox`, `data/bottles.ts`): display cases built as real boxes in CSS 3D:
  cream lacquer sides, a lit back panel and inner walls, glass shelves with LED edges, and each
  house's bottles standing at mid-depth (cut-outs made from the product photographs). Every
  size is in a `--u` unit set by whoever places the case, so the same case works on the floor,
  in the still layout and in the room. In 3D the case's own planes sit in front of its
  bottles, so in the room only the bottles take the pointer.
- **Cabinet room** (`CabinetRoom`): a modal dialog (page inert, Esc closes, focus returns to
  the case). The case on the floor morphs into the room (`cabinet-*` view-transition names),
  its glass doors swing open in 3D, and it turns gently to follow a mouse. Beside it, the
  house panel (story, prices, the way to its aisle), or Ava when she's on.
- **View transitions** (`components/ui/PageTransition.tsx` + `globals.css`): `aisle-*` names
  morph an aisle card into the aisle hero; `product-*` names morph product
  photos into the product page. Navigation types: `walk-in`, `nav-forward`, `nav-back`, `filter`.
- **Scroll reveals** (`.reveal`, `.reveal-clip`): CSS scroll-driven animations, off the main
  thread; unsupported browsers simply show content.

## Data & integrations

- `getProducts()`, `getBrands()` etc. in `src/lib/catalog.ts` are async on purpose: swap the sample
  catalogue in `src/data` for the live Whatnot / TikTok Shop inventory without touching the UI.
- Prices are integer cents. The bag lives in `localStorage` via a tiny external store
  (`src/lib/cart-store.ts`) and is re-priced from the catalogue on every render.
- `src/app/actions.ts` validates the newsletter and contact forms on the server. **Both have
  `Integration point` comments** where the email platform / inbox needs to be connected.

## Before launch

- **Prices and assortment** in `src/data/products.ts` are placeholders.
- **Checkout** is not connected to a payment provider; the bag's CTA is disabled and points
  customers to an advisor.
- **Policy copy** (`src/content/help.ts`) and **story claims** (`src/content/about.ts`) need
  confirming by the business.
- **Photography** is from Unsplash (free licence, see `src/assets/images/CREDITS.json`). Brand
  bottles are shown as product photography for a reseller; the concierge photo is stock imagery,
  so replace it with a real team member (with consent) before launch.
- **Forms**: connect the newsletter provider and contact inbox (see above).
