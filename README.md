# Perfume Hut

Storefront for **Perfume Hut** ([perfumehut.co](https://perfumehut.co)), a multi-brand designer
fragrance store. The home page opens on the Perfume Hut wordmark, then a scroll-driven virtual
tour: a gallery wall of framed bottles beside an arched doorway onto a parfumerie shopfront.
Scrolling opens the arch, "Welcome to Perfume Hut" appears over the facade, and you walk through
the window into the store: a WebGL boutique in the shopfront's own colours (slate panelling,
dusty-rose window dressing, globe lamps, brass), with a lit display case for every house down
both walls and every bottle on its shelves modelled in 3D. The lights come up as you arrive, and
scrolling glides you from case to case, each seen at a three-quarter angle, the house named in
large type at the foot of the screen. Stepping inside walks you up to the case and swings its
glass doors open; each product page can show its bottle in 3D as well.

Ava, an AI fragrance advisor who guides the walk and recommends a bottle, is built but switched
off for now: set `flags.ava` in `src/lib/flags.ts` to `true` to bring her back everywhere.

## Stack

| Concern   | Choice                                                                                    |
| --------- | ----------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19.3                                            |
| Language  | TypeScript (strict, `noUncheckedIndexedAccess`, typed routes)                             |
| Styling   | CSS Modules + design tokens in `src/app/globals.css`, no runtime CSS-in-JS                |
| Motion    | CSS transitions & scroll-driven animations, Motion for the tour, React `<ViewTransition>` |
| 3D        | three.js (plain, no React renderer): the store floor and the product page's bottle view   |
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

| Route                                             | Rendering | Notes                                                    |
| ------------------------------------------------- | --------- | -------------------------------------------------------- |
| `/`                                               | Static    | Virtual tour, marquee, why-us, notes, bestsellers, films |
| `/shop`                                           | Dynamic   | Filters (for / family / house) and sort via URL params   |
| `/brands`                                         | Static    | Store directory ("the aisles")                           |
| `/brands/[slug]`                                  | SSG       | An aisle: hero, story, shelf, previous/next aisle        |
| `/products/[slug]`                                | SSG       | Size selector, add to bag, notes pyramid, related        |
| `/bag`                                            | Static    | Client bag; checkout CTA disabled until payments exist   |
| `/search`                                         | Dynamic   | Full results; the header's search shows them as you type |
| `/about`, `/contact`, `/faq`, `/shipping-returns` | Static    | Contact form uses a server action                        |

## Project structure

```
src/
  app/                  Routes, layout, server actions, metadata files (icons, OG, sitemap, robots)
  assets/images/        Photography (see CREDITS.json), imported statically
  components/
    tour/               StoreTour (scroll stage), Entrance (gallery wall + shopfront arch),
                        StoreFloor (hosts the 3D store), FloorCaption (the words at each
                        stop), CabinetRoom (inside a case); Ava (off): AvaGuide,
                        AvaConversation, AvaFigure (poses + lips), AvaSubtitles
      store3d/          The WebGL store, no React: StoreScene (renderer, camera, loop),
                        room, cabinet, bottle (a bottle built from its spec), textures
                        (drawn on canvas), materials (the palette); BottleStage (one bottle,
                        for the product page)
    home/               Hero (wordmark) and the sections below the tour, including the
                        customer films (VideoStories, StoryReel, StoryViewer)
    product/ brand/     Cards, grids, purchase panel (with the phone's sticky bar),
                        ProductMedia + BottleViewer (photo or 3D), aisle hero/nav
    cart/               Bag drawer, lines, summary, header button
    layout/ ui/ seo/    Header, footer, menus, primitives, JSON-LD
  content/              All copy, links and editorial choices, typed
  data/                 Brands, products (sample catalogue) and bottles.ts: each bottle's
                        shape, glass, juice, cap and label, for building it in 3D
  lib/                  Catalogue queries, shop filters, search, cart, money, validation, JSON-LD,
                        feature flags (flags.ts)
```

## Motion principles

Motion follows Emil Kowalski's design-engineering guidelines:

- **Only `transform` and `opacity` animate**; Motion values use full transform strings so the
  compositor does the work. Settled states reset to `transform: none` so text stays crisp.
- **Custom curves** (`--ease-out`, `--ease-in-out`, `--ease-drawer`), never `ease-in`.
- **UI is fast** (150–300 ms); storytelling moments (the tour, the aisle walk-in) can be longer.
- **Enter slower than exit** (bag drawer 460 ms in / 280 ms out; a house's name rises in, the room's panel leaves fast).
- **Interruptible**: dropdowns, accordions, size selector and drawer use CSS transitions.
- **Press feedback** (`scale(0.97)`) on everything pressable; hover effects only on
  `(hover: hover) and (pointer: fine)`.
- **Reduced motion means gentler, not none**: the tour becomes one still view of the floor with
  its houses listed to step into, bottles stop turning, reveals and marquee stop, transitions
  fall back to fades.

How the pieces fit:

- **Tour** (`components/tour`, `lib/tour-plan.ts`): a pinned 100svh stage over a long scroll
  track. Scroll (lightly spring-smoothed) opens the doorway's clip, shows the welcome over the
  shopfront and walks you through its window; warm glare off the glass covers the step inside
  (opacity only: no full-screen blur filters, which were the old lag). The store floor is
  WebGL (`store3d/`), in the shopfront's colours: slate panelling with pale mouldings, a cream
  and slate stone checker with a rose runner, a coffered ceiling with lit coves, globe pendants
  like the lamp over the door, and an arched niche at the far end under a gold-leaf sign. Each
  case is slate joinery with a rose-lit niche, glass shelves with LED edges, glass doors in
  brass and the house name in gold leaf; its bottles are built from `data/bottles.ts`. The
  lights come up case by case as you arrive, one warm light follows you to the case you're at,
  and on a mouse the camera glances a little towards the pointer. "Skip the tour" jumps past;
  with reduced motion the floor stands still and lists its houses to step into.
- **The walk** (`tour-plan.ts`, plain and tested): keyframes for where the camera stands (a
  three-quarter view of each case; on phones, the case high on the screen above the words),
  joined by a centripetal Catmull-Rom path. Between keys the walk eases a little but never
  stops, and there are no scroll-snap points, so it flows like an ordinary page; the camera
  then follows the scroll with a little damping. `poseAt` gives the camera for any scroll
  position, `stopAt` the house you're nearest. The store only renders while something moves
  and stops drawing off screen; a slow phone drops resolution before it drops frames.
- **Captions** (`FloorCaption`): no floating cards. The house is set like the welcome over
  the shopfront, large cream Marcellus at the foot of the screen over a soft slate fade, with
  the cabinet number, how many bottles and the price from, "Step inside" and the way to its
  aisle. Beside it, the run of houses (a slim progress line on phones); choosing one walks you
  there. The words step aside for the last look down the floor; there's no closing card.
- **Feature flags** (`lib/flags.ts`): `ava` switches the advisor on or off everywhere. While
  she's off, the floor's captions speak for each stop and a house panel stands beside the
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
- **Bottles** (`data/bottles.ts`, `store3d/bottle.ts`): every product has a spec taken from
  the real bottle: body shape (flacon, disc, cylinder, flask or cut gem), glass (clear,
  frosted, tinted or lacquered), the colour of the juice, cap and collar finishes, the label
  set in type (never brand artwork) and details such as a Greek-key border, a medallion, a
  bow, fluting or glitter. They stand straight, scaled to one display height, on the shelves.
- **Cabinet room** (`CabinetRoom`): tapping a case, or "Step inside", walks the camera up to
  it square on and its doors swing open; the bottles turn slowly so you see them in the round,
  and the one you point at turns to you with its name. It's a modal dialog (page inert, Esc
  closes, focus returns), with the house panel beside the case (a sheet beneath it on phones):
  story, the bottles as links that light up their bottle, prices and the way to its aisle, or
  Ava when she's on.
- **Phone header and menu** (`HeaderShell`, `MobileMenu`): on phones the header sticks, frosts
  over the page once you scroll, slips away as you scroll down and returns as soon as you
  scroll up; it stays hidden while anything marked `data-immersive` (the store tour) fills the
  screen, and never hides while you're using it. The menu is a cream sheet that drops from
  the top, its bar laid out like the header so the menu button becomes close in place: search,
  the numbered rooms of the store, "Shop by" chips, the aisles in arched doorways you swipe
  along, and the live-shopping note. Its contents rise in one after another; leaving animates.
- **Customer films** (`VideoStories`, `StoryReel`, `StoryViewer`, `content/stories.ts`): video
  feedback in place of written testimonials. Five portrait films in a staggered reel on the
  espresso panel, each with the bottle it's about beneath it. With a mouse every film in
  view plays muted; on a phone only the one you've swiped to, to save data; with reduced
  motion they show their posters. Tapping one opens a stories-style viewer: a bar per film,
  tap right for next and left for back, hold to pause, swipe sideways to move and down to
  close, Esc to close. Their words run beneath as subtitles, with the bottle ready to add to
  the bag in one tap.
- **Header search** (`HeaderSearch`): the icon grows into a field in place (a clip-path
  transition from the icon's own circle), and results drop down as you type, searched in the
  browser with the same matching as the results page (`lib/search.ts`). Enter opens the full
  results; Esc or a click elsewhere folds it back.
- **Product page**: the photograph or the bottle in 3D (`BottleViewer`: drag to turn, slow
  turntable, paused off screen) held in view beside the buying column; then how the notes
  unfold over time, the character (family, strength, who it's for), the house it comes from
  and its aisle, the details and more from the floor. On phones an add-to-bag bar follows you
  down the page once the main button scrolls away.
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
  so replace it with a real team member (with consent) before launch. Two About photos show
  houses we don't stock (a heritage counter and a discovery set); their labels are barely
  legible, but swap them for the store's own photography when it exists.
- **3D bottles** are faithful sketches in shape and colour, set with plain type; if the houses
  supply official 3D assets, `store3d/bottle.ts` is where they would replace the built ones.
- **Forms**: connect the newsletter provider and contact inbox (see above).
- **Customer films are placeholders.** The five films are Pexels stock footage and the names,
  cities and words in `src/content/stories.ts` were written for layout. Replace them with real
  customers' own videos and quotes, with their consent. Keep them portrait, around 10 seconds
  and compressed for the web (720×1280 H.264 with `+faststart`, roughly 1 MB each), and set
  `sound: true` on films with a voice so the viewer shows the sound button.
