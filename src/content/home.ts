import type { Route } from 'next';
import type { StaticImageData } from 'next/image';
import editorialHandBottle from '@/assets/images/editorial/hand-bottle.jpg';
import editorialNeck from '@/assets/images/editorial/neck.jpg';
import editorialPortraitBottle from '@/assets/images/editorial/portrait-bottle.jpg';
import storySauvage from '@/assets/images/editorial/story-sauvage.jpg';
import storySmoke from '@/assets/images/editorial/story-smoke.jpg';
import storySpray from '@/assets/images/editorial/story-spray.jpg';
import editorialVelvet from '@/assets/images/editorial/velvet.jpg';
import editorialWrist from '@/assets/images/editorial/wrist.jpg';
import acquaDiGio from '@/assets/images/hero/acqua-di-gio.jpg';
import yslLibre from '@/assets/images/hero/ysl-libre.jpg';
import noteAmber from '@/assets/images/notes/amber.jpg';
import noteCitrus from '@/assets/images/notes/citrus.jpg';
import noteFloral from '@/assets/images/notes/floral.jpg';
import concierge from '@/assets/images/store/concierge.jpg';
import parfumerie from '@/assets/images/store/parfumerie.jpg';
import type { AvaPoseName } from '@/data/ava-poses';
import { routes, shopHref } from './routes';

export type ContentImage = { src: StaticImageData; alt: string };

export const eyebrowLabel = 'Fine Fragrance';

/* ---------- Hero ---------- */

export const hero = {
  eyebrow: 'Designer Fragrance',
  tagline: ['Wear what can’t be seen, scent', 'that lingers longer than presence'],
  title: 'Perfume Hut',
  priceLabel: 'Starting from',
  cta: { label: 'Shop Collections', href: routes.shop },
} as const satisfies {
  eyebrow: string;
  tagline: readonly string[];
  title: string;
  priceLabel: string;
  cta: { label: string; href: Route };
};

/* ---------- Virtual store tour ---------- */

export type EntranceFrameContent = { slug: string; image: ContentImage };

export const tour = {
  scrollCue: 'Scroll to step inside',
  skipLabel: 'Skip the walk-in',
  welcome: ['Welcome to', 'Perfume Hut'],
  entrance: {
    label: {
      eyebrow: 'At the door',
      text: ['Two signatures on the wall.', 'Hundreds more inside.'],
    },
    /** Two signatures hang at the door, each linking to its product page. */
    frames: [
      {
        slug: 'ysl-libre-eau-de-parfum',
        image: {
          src: yslLibre,
          alt: 'Yves Saint Laurent Libre, its gold emblem catching a beam of light against black',
        },
      },
      {
        slug: 'armani-acqua-di-gio-eau-de-parfum',
        image: {
          src: acquaDiGio,
          alt: 'Acqua di Giò Eau de Parfum glowing amber under a warm lamp',
        },
      },
    ],
    /** The shopfront seen through the arch; you walk in through its centre window. */
    storefront: {
      src: parfumerie,
      alt: 'A Parisian parfumerie: arched windows dressed with perfume and flowers, potted plants at the door',
      /** The point you walk towards, as % of the photo (the arch centres on it). */
      focus: { x: 50.5, y: 50 },
    },
  },
} as const satisfies {
  scrollCue: string;
  skipLabel: string;
  welcome: readonly string[];
  entrance: {
    label: { eyebrow: string; text: readonly string[] };
    frames: readonly [EntranceFrameContent, EntranceFrameContent];
    storefront: ContentImage & { focus: { x: number; y: number } };
  };
};

/* ---------- The store floor ---------- */

/** What the floor says at each stop (with Ava off, these placards do the talking). */
export const storeFloor = {
  intro: {
    eyebrow: 'The store floor',
    title: ['Eight houses,', 'one floor.'],
    text: 'Every house has its own cabinet. Scroll to walk the floor, or step into any cabinet.',
  },
  /** Reduced motion: no walk, every cabinet on one wall. */
  still: 'Every house has its own cabinet. Step into any of them to see its shelves.',
  outro: {
    eyebrow: 'That’s the floor',
    title: ['Step into', 'any cabinet.'],
    text: 'Or browse every bottle at once.',
  },
  fragrances: (count: number) => `${count} ${count === 1 ? 'fragrance' : 'fragrances'}`,
  from: (price: string) => `from ${price}`,
  favourite: 'Most asked for',
  stepInside: (house: string) => `Step inside ${house}`,
  visitAisle: (house: string) => `Visit the ${house} aisle`,
  browseAll: { label: 'Browse everything', href: routes.shop },
  scrollHint: 'Scroll to walk the floor',
  skip: 'Skip the tour',
  room: {
    eyebrow: (number: string) => `Cabinet No. ${number}`,
    close: 'Back to the store floor',
    fragrances: (count: number) => `${count} ${count === 1 ? 'fragrance' : 'fragrances'}`,
    from: (price: string) => `From ${price}`,
    hint: 'Choose a bottle from the shelves to see it up close.',
  },
};

/* ---------- Ava, the fragrance advisor (switched off: see lib/flags.ts) ---------- */

/**
 * Placeholder script for Ava. Each line is written to be spoken, so a voiced
 * AI avatar can replace the text later without changing the flow.
 */
export const ava = {
  name: 'Ava',
  role: 'Fragrance advisor',
  alt: 'Ava, the Perfume Hut fragrance advisor, in a green blazer',
  floor: {
    intro: {
      pose: 'welcome',
      line: 'Hi, I’m Ava — welcome to Perfume Hut. Every house has its own cabinet on this floor. Keep scrolling and I’ll walk you round.',
    },
    /** One line per cabinet: an opener, then lines that take turns, then a closer. */
    first: (house: string, tagline: string, pick: string) =>
      `First, ${house}. ${tagline} If you try one thing here, make it ${pick}.`,
    houses: [
      (house: string, tagline: string, pick: string) =>
        `This is ${house}. ${tagline} ${pick} is the bottle people ask for.`,
      (house: string, tagline: string, pick: string) =>
        `Next, ${house}. ${tagline} I’d start with ${pick}.`,
      (house: string, tagline: string, pick: string) =>
        `And here’s ${house}. ${tagline} ${pick} never stays on the shelf for long.`,
    ],
    last: (house: string, tagline: string, pick: string) =>
      `Last on the floor, ${house}. ${tagline} Ask me about ${pick}.`,
    /** Gestures towards the cabinet, in the same rotation. */
    housePoses: ['present', 'point', 'here', 'idea'],
    /** While walking between cabinets. */
    walkPose: 'listen',
    outro: {
      pose: 'listen',
      line: 'And that’s the whole floor. Tap any cabinet to step inside, or browse everything at once.',
    },
    scrollHint: 'Scroll to walk the floor',
    stepInside: (house: string) => `Step inside ${house}`,
    browseAll: { label: 'Browse everything', href: routes.shop },
    skip: 'Skip the tour',
  },
  room: {
    poses: { who: 'present', mood: 'think', pick: 'point' },
    hello: (brand: string, tagline: string) =>
      `${brand}. ${tagline} Good choice. Who are we choosing for?`,
    who: { him: 'For him', her: 'For her', anyone: 'For anyone' },
    mood: 'Lovely. And how would you like it to feel on the skin?',
    moods: {
      fresh: 'Fresh & clean',
      floral: 'Soft & floral',
      woody: 'Warm & woody',
      amber: 'Rich & sensual',
      aromatic: 'Herbal & bright',
      gourmand: 'Sweet & cosy',
    },
    surprise: 'Surprise me',
    pick: (name: string, summary: string, top: string, base: string) =>
      `Then my pick is ${name}. ${summary} It opens on ${top} and settles into ${base}.`,
    near: 'Nothing on these shelves is quite that, so here’s the closest.',
    pickLabel: 'Ava’s pick',
    view: (name: string) => `See ${name}`,
    again: 'Ask again',
    visit: (brand: string) => `Visit the ${brand} aisle`,
    close: 'Back to the store floor',
  },
} as const satisfies {
  // Only the poses are checked here; every pose named must exist.
  floor: {
    intro: { pose: AvaPoseName; line: string };
    housePoses: readonly AvaPoseName[];
    walkPose: AvaPoseName;
    outro: { pose: AvaPoseName; line: string };
  } & Record<string, unknown>;
  room: { poses: Record<'who' | 'mood' | 'pick', AvaPoseName> } & Record<string, unknown>;
} & Record<string, unknown>;

/* ---------- Why Perfume Hut ---------- */

export type Feature = {
  index: string;
  title: string;
  description: readonly string[];
};

export const features = {
  heading: ['Every bottle on', 'our shelves is', 'the real thing.'],
  items: [
    {
      index: '01',
      title: 'Authentic, always',
      description: [
        'Sourced through authorised distribution —',
        'sealed, full-size, never decanted.',
      ],
    },
    {
      index: '02',
      title: 'Hard-to-find, in stock',
      description: ['Sold out elsewhere? Our network often', 'still has it. Ask and we’ll look.'],
    },
    {
      index: '03',
      title: 'Decades behind the counter',
      description: [
        'We ran fragrance counters for years.',
        'Tell us what you love; we’ll match it.',
      ],
    },
    {
      index: '04',
      title: 'Packed by hand',
      description: ['Every order is wrapped with care and', 'tracked all the way to your door.'],
    },
  ],
  images: [
    { src: editorialWrist, alt: 'Perfume being sprayed onto a wrist' },
    { src: editorialHandBottle, alt: 'A hand holding a perfume bottle up to the light' },
    { src: editorialNeck, alt: 'A woman applying fragrance to her neck' },
    { src: editorialPortraitBottle, alt: 'A woman in a pink blazer with a perfume bottle' },
  ],
} as const satisfies {
  heading: readonly string[];
  items: readonly [Feature, Feature, Feature, Feature];
  images: readonly [ContentImage, ContentImage, ContentImage, ContentImage];
};

/* ---------- Notes ---------- */

export type StoryOverlay =
  | { kind: 'quote'; lines: readonly string[] }
  | { kind: 'caption'; title: string; lines: readonly string[] };

export type Story = ContentImage & {
  overlay?: StoryOverlay;
  showActions: boolean;
};

export type StoryAuthor = {
  handle: string;
  avatar: StaticImageData;
  postedAgo: string;
  soundtrack: string;
};

export type FamilyBottle = ContentImage & { label: string; href: Route };

export const notes = {
  heading: ['Not every note arrives', 'at once'],
  storyAuthor: {
    handle: 'perfumehut',
    avatar: concierge,
    postedAgo: '2h',
    soundtrack: 'Original audio',
  },
  stories: [
    {
      src: storySmoke,
      alt: 'An amber perfume bottle wreathed in smoke on dark stone',
      overlay: {
        kind: 'quote',
        lines: ['Wear what can’t be seen, scent that', 'lingers longer than presence'],
      },
      showActions: true,
    },
    {
      src: storySpray,
      alt: 'A woman spraying perfume beside a warm curtain',
      showActions: true,
    },
    {
      src: storySauvage,
      alt: 'Dior Sauvage glinting in low light',
      overlay: {
        kind: 'caption',
        title: 'Layered complexity',
        lines: ['Every scent unfolds in phases—from bright', 'opening notes to intimate dry-down.'],
      },
      showActions: false,
    },
  ],
  phases: [
    {
      index: '01',
      title: 'Top notes',
      description: 'The first spark — citrus, herbs and spice in the opening minutes',
    },
    {
      index: '02',
      title: 'Heart notes',
      description: 'Florals and spices bloom as the opening fades',
    },
    {
      index: '03',
      title: 'Base notes',
      description: 'Woods, musks and vanilla anchor the scent for hours',
    },
    {
      index: '04',
      title: 'Dry-down',
      description: 'The warm, skin-close trace people remember you by',
    },
  ],
  lede: ['Find your fragrance family —', 'amber, floral or fresh.'],
  bottles: [
    { src: noteAmber, alt: '', label: 'Amber', href: shopHref({ family: 'amber' }) },
    { src: noteFloral, alt: '', label: 'Floral', href: shopHref({ family: 'floral' }) },
    { src: noteCitrus, alt: '', label: 'Fresh', href: shopHref({ family: 'fresh' }) },
  ],
  caption: ['Not sure where to start? Tap a', 'bottle to browse its family.'],
  photo: { src: editorialVelvet, alt: 'A crystal-cut perfume bottle resting on dark velvet' },
} as const satisfies {
  heading: readonly string[];
  storyAuthor: StoryAuthor;
  stories: readonly [Story, Story, Story];
  phases: readonly { index: string; title: string; description: string }[];
  lede: readonly string[];
  bottles: readonly [FamilyBottle, FamilyBottle, FamilyBottle];
  caption: readonly string[];
  photo: ContentImage;
};

/* ---------- Bestsellers ---------- */

export const bestsellers = {
  /** Featured first: the large card. */
  slugs: ['dior-sauvage-eau-de-parfum', 'chanel-coco-mademoiselle', 'ysl-libre-eau-de-parfum'],
  heading: [
    'The bottles our regulars come back for —',
    'Sauvage, Coco Mademoiselle, Libre and more,',
    'hand-picked from every aisle.',
  ],
  cta: { label: 'All Fragrances', href: routes.shop },
} as const;
