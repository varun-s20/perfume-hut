/**
 * Every bottle on the shelves, described so it can be built in 3D: the shape
 * of its glass, what's inside, its cap and its label. Sizes are in cm, taken
 * from the real bottles (the store shows them as large display factices, so
 * only proportions matter). Keyed by product slug.
 *
 * Labels are set in type, never brand artwork.
 */

/** A surface colour, or one of the stock metals and lacquers. */
export type Finish = 'gold' | 'silver' | 'gunmetal' | 'black' | 'white' | 'clear' | `#${string}`;

export type BottleSpec = {
  /** block: a rectangular flacon; round: a disc seen face-on; cylinder: round in plan, shoulders at the top; flask: soft pebble; facet: a cut gem. */
  body: 'block' | 'round' | 'cylinder' | 'flask' | 'facet';
  /** Width, height and depth of the body (cm). */
  size: readonly [number, number, number];
  /** Corner radius (cm), for blocks and flasks. */
  radius?: number;
  /**
   * clear: you see the juice; frosted: milky glass; tinted: deep coloured
   * glass you can't see into; opaque: lacquered or metallic all over.
   */
  glass: 'clear' | 'frosted' | 'tinted' | 'opaque';
  /** Colour of tinted or opaque glass. */
  tint?: string;
  /** Colour of the juice, for clear and frosted glass. */
  juice?: string;
  cap: {
    shape: 'cylinder' | 'block' | 'dome' | 'facet' | 'ribbed';
    /** Width, height, depth (cm); cylinders use the width as the diameter. */
    size: readonly [number, number, number];
    finish: Finish;
    /** A band of a second finish round the cap. */
    band?: Finish;
  };
  /** The collar between body and cap. */
  collar?: Finish;
  label?: {
    lines: readonly string[];
    ink: string;
    /** A printed plate behind the type; none means type straight on the glass. */
    plate?: string;
    font?: 'serif' | 'sans';
    /** Size of the label as a share of the front face. */
    width?: number;
    height?: number;
    /** Centre of the label from the foot of the body, as a share of its height. */
    at?: number;
  };
  /** Details that make the bottle recognisable. */
  detail?: {
    kind: 'greek-key' | 'medallion' | 'stripe' | 'bow' | 'flutes' | 'glitter' | 'frame';
    colour: string;
  }[];
};

export const bottleSpecs: Record<string, BottleSpec> = {
  // ---------- Versace ----------
  'versace-eros-eau-de-toilette': {
    body: 'block',
    size: [9.2, 9.6, 4.4],
    radius: 0.7,
    glass: 'tinted',
    tint: '#1fb7c1',
    cap: { shape: 'cylinder', size: [3.2, 3.4, 3.2], finish: '#1aa9b5', band: 'gold' },
    collar: 'gold',
    label: {
      lines: ['VERSACE', 'EROS'],
      ink: '#f4dd9c',
      font: 'serif',
      width: 0.6,
      height: 0.2,
      at: 0.2,
    },
    detail: [
      { kind: 'greek-key', colour: '#7fe3e6' },
      { kind: 'medallion', colour: 'gold' },
    ],
  },
  'versace-eros-eau-de-parfum': {
    body: 'block',
    size: [9.2, 9.6, 4.4],
    radius: 0.7,
    glass: 'tinted',
    tint: '#0f5f78',
    cap: { shape: 'cylinder', size: [3.2, 3.4, 3.2], finish: '#0d5a73', band: 'gold' },
    collar: 'gold',
    label: {
      lines: ['VERSACE', 'EROS'],
      ink: '#e9c97c',
      font: 'serif',
      width: 0.6,
      height: 0.2,
      at: 0.2,
    },
    detail: [
      { kind: 'greek-key', colour: '#3fa2b4' },
      { kind: 'medallion', colour: 'gold' },
    ],
  },
  'versace-dylan-blue': {
    body: 'block',
    size: [8.6, 10.4, 4],
    radius: 0.8,
    glass: 'tinted',
    tint: '#1b2f9a',
    cap: { shape: 'cylinder', size: [3, 2.8, 3], finish: '#16236e', band: 'gold' },
    collar: 'gold',
    label: {
      lines: ['VERSACE', 'DYLAN BLUE'],
      ink: '#e2c682',
      font: 'serif',
      width: 0.64,
      height: 0.18,
      at: 0.18,
    },
    detail: [
      { kind: 'greek-key', colour: '#3f58d0' },
      { kind: 'medallion', colour: 'silver' },
    ],
  },
  'versace-crystal-noir': {
    body: 'facet',
    size: [8.6, 9.2, 5.2],
    glass: 'opaque',
    tint: '#16121a',
    cap: { shape: 'facet', size: [3.4, 3, 3.4], finish: 'gold' },
    collar: 'gold',
  },

  // ---------- Gucci ----------
  'gucci-bloom': {
    body: 'block',
    size: [7.4, 9.6, 4.4],
    radius: 1.4,
    glass: 'opaque',
    tint: '#f2cfc8',
    cap: { shape: 'cylinder', size: [3.6, 3.8, 3.6], finish: '#f0cbc4' },
    collar: '#e9c2bb',
    label: {
      lines: ['GUCCI', 'BLOOM'],
      ink: '#1a1a1a',
      plate: '#fbf8f3',
      font: 'serif',
      width: 0.52,
      height: 0.5,
      at: 0.5,
    },
    detail: [{ kind: 'frame', colour: '#1a1a1a' }],
  },
  'gucci-guilty-pour-femme': {
    body: 'block',
    size: [7.6, 10.2, 3.6],
    radius: 1.6,
    glass: 'clear',
    tint: '#e8d7ec',
    juice: '#d9b8e4',
    cap: { shape: 'cylinder', size: [2.6, 3.6, 2.6], finish: 'gold' },
    collar: 'gold',
    label: {
      lines: ['GUCCI GUILTY', 'POUR FEMME'],
      ink: '#6b4c1e',
      plate: '#d9b46a',
      font: 'sans',
      width: 0.9,
      height: 0.42,
      at: 0.3,
    },
  },
  'gucci-memoire-dune-odeur': {
    body: 'cylinder',
    size: [4.6, 11.4, 4.6],
    glass: 'tinted',
    tint: '#2f9a6c',
    cap: { shape: 'cylinder', size: [3.2, 3.4, 3.2], finish: 'gold' },
    collar: 'gold',
    label: {
      lines: ['GUCCI', 'MÉMOIRE'],
      ink: '#3a2a12',
      plate: '#efe2bf',
      font: 'serif',
      width: 0.7,
      height: 0.24,
      at: 0.56,
    },
    detail: [{ kind: 'flutes', colour: '#2f9a6c' }],
  },

  // ---------- Prada ----------
  'prada-luna-rossa-black': {
    body: 'block',
    size: [7.6, 10.6, 3.8],
    radius: 0.6,
    glass: 'tinted',
    tint: '#1b2236',
    cap: { shape: 'block', size: [3.4, 3, 2.6], finish: 'black', band: '#c8282e' },
    collar: 'gunmetal',
    label: { lines: ['PRADA'], ink: '#e9e9ec', font: 'sans', width: 0.4, height: 0.1, at: 0.24 },
    detail: [{ kind: 'stripe', colour: '#d0262c' }],
  },
  'prada-lhomme': {
    body: 'block',
    size: [7.8, 10.4, 4.2],
    radius: 1.2,
    glass: 'clear',
    juice: '#f1ece2',
    cap: { shape: 'cylinder', size: [2.8, 3, 2.8], finish: 'silver' },
    collar: 'silver',
    label: {
      lines: ['PRADA', 'MILANO'],
      ink: '#1b1b1d',
      plate: '#f4f4f2',
      font: 'sans',
      width: 0.56,
      height: 0.22,
      at: 0.62,
    },
  },
  'prada-candy': {
    body: 'cylinder',
    size: [6.4, 8.4, 6.4],
    glass: 'clear',
    juice: '#f2629a',
    cap: { shape: 'dome', size: [4, 2.6, 4], finish: '#f7d6e4' },
    collar: 'silver',
    label: {
      lines: ['PRADA', 'CANDY'],
      ink: '#ffffff',
      font: 'sans',
      width: 0.6,
      height: 0.2,
      at: 0.45,
    },
  },

  // ---------- Dior ----------
  'dior-sauvage-eau-de-parfum': {
    body: 'block',
    size: [6.6, 11.8, 4],
    radius: 0.5,
    glass: 'tinted',
    tint: '#16244a',
    cap: { shape: 'ribbed', size: [4.4, 4.2, 4.4], finish: 'black', band: 'silver' },
    collar: 'gunmetal',
    label: {
      lines: ['SAUVAGE', 'EAU DE PARFUM'],
      ink: '#e9ecf2',
      font: 'serif',
      width: 0.82,
      height: 0.2,
      at: 0.62,
    },
  },
  'dior-miss-dior-eau-de-parfum': {
    body: 'block',
    size: [8.6, 7.8, 5.2],
    radius: 0.6,
    glass: 'clear',
    juice: '#f3bfa4',
    cap: { shape: 'facet', size: [4.4, 3, 3.2], finish: 'clear' },
    collar: 'silver',
    label: {
      lines: ['Miss Dior'],
      ink: '#4b3a33',
      plate: '#f6efe6',
      font: 'serif',
      width: 0.5,
      height: 0.22,
      at: 0.5,
    },
    detail: [{ kind: 'bow', colour: 'silver' }],
  },
  'dior-miss-dior-blooming-bouquet': {
    body: 'block',
    size: [8.6, 7.8, 5.2],
    radius: 0.6,
    glass: 'clear',
    juice: '#f7cbd4',
    cap: { shape: 'facet', size: [4.4, 3, 3.2], finish: 'clear' },
    collar: 'silver',
    label: {
      lines: ['Miss Dior'],
      ink: '#7b5560',
      plate: '#fbf1f2',
      font: 'serif',
      width: 0.5,
      height: 0.22,
      at: 0.5,
    },
    detail: [{ kind: 'bow', colour: '#e9c4cc' }],
  },

  // ---------- Chanel ----------
  'chanel-no5-eau-de-parfum': {
    body: 'block',
    size: [7.2, 9.4, 3.4],
    radius: 0.35,
    glass: 'clear',
    juice: '#e7ad45',
    cap: { shape: 'facet', size: [4.2, 2.8, 2.8], finish: 'clear' },
    collar: 'clear',
    label: {
      lines: ['N°5', 'CHANEL', 'PARIS'],
      ink: '#111111',
      plate: '#fbfaf6',
      font: 'sans',
      width: 0.42,
      height: 0.4,
      at: 0.6,
    },
  },
  'chanel-coco-mademoiselle': {
    body: 'block',
    size: [7.2, 9.6, 3.4],
    radius: 0.35,
    glass: 'clear',
    juice: '#ee7a55',
    cap: { shape: 'block', size: [3.6, 2.8, 2.6], finish: 'clear' },
    collar: 'clear',
    label: {
      lines: ['COCO', 'MADEMOISELLE', 'CHANEL'],
      ink: '#111111',
      plate: '#fbfaf6',
      font: 'sans',
      width: 0.46,
      height: 0.4,
      at: 0.62,
    },
  },
  'bleu-de-chanel-eau-de-parfum': {
    body: 'block',
    size: [7.6, 9.2, 3.8],
    radius: 0.3,
    glass: 'tinted',
    tint: '#14214f',
    cap: { shape: 'block', size: [4.2, 3.2, 3.2], finish: 'black' },
    collar: 'black',
    label: {
      lines: ['BLEU', 'DE', 'CHANEL'],
      ink: '#f2f2f4',
      font: 'sans',
      width: 0.5,
      height: 0.36,
      at: 0.66,
    },
  },
  'chanel-chance-eau-tendre': {
    body: 'round',
    size: [9, 9, 4],
    glass: 'clear',
    juice: '#f6c9c6',
    cap: { shape: 'block', size: [3, 3.2, 2.4], finish: 'clear' },
    collar: 'silver',
    label: {
      lines: ['CHANCE', 'CHANEL'],
      ink: '#ffffff',
      font: 'sans',
      width: 0.5,
      height: 0.2,
      at: 0.5,
    },
  },
  'chanel-gabrielle': {
    body: 'block',
    size: [6.8, 9.8, 3.2],
    radius: 0.3,
    glass: 'clear',
    juice: '#f2c55e',
    cap: { shape: 'block', size: [3.2, 3, 3], finish: 'gold' },
    collar: 'gold',
    label: {
      lines: ['GABRIELLE', 'CHANEL'],
      ink: '#111111',
      plate: '#fbfaf6',
      font: 'sans',
      width: 0.44,
      height: 0.3,
      at: 0.56,
    },
  },

  // ---------- Yves Saint Laurent ----------
  'ysl-libre-eau-de-parfum': {
    body: 'block',
    size: [7.2, 8.6, 4.2],
    radius: 0.5,
    glass: 'clear',
    juice: '#e8b04a',
    cap: { shape: 'block', size: [3.8, 3.4, 3], finish: 'black' },
    collar: 'gold',
    label: { lines: ['YSL'], ink: '#f2cf76', font: 'serif', width: 0.9, height: 0.7, at: 0.5 },
  },
  'ysl-black-opium': {
    body: 'block',
    size: [6.4, 10.6, 3.6],
    radius: 2,
    glass: 'opaque',
    tint: '#141016',
    cap: { shape: 'dome', size: [3.4, 3.6, 3.4], finish: 'black' },
    collar: 'gunmetal',
    label: {
      lines: ['BLACK', 'OPIUM'],
      ink: '#efe7ea',
      font: 'sans',
      width: 0.6,
      height: 0.2,
      at: 0.46,
    },
    detail: [{ kind: 'glitter', colour: '#d9c6d2' }],
  },
  'ysl-la-nuit-de-lhomme': {
    body: 'block',
    size: [7, 6.4, 3.8],
    radius: 0.4,
    glass: 'clear',
    juice: '#c9c4bc',
    cap: { shape: 'facet', size: [6.2, 4.6, 3.8], finish: 'black' },
    collar: 'black',
    label: {
      lines: ['LA NUIT DE', 'L’HOMME'],
      ink: '#18171a',
      font: 'serif',
      width: 0.86,
      height: 0.3,
      at: 0.3,
    },
  },

  // ---------- Armani ----------
  'armani-acqua-di-gio': {
    body: 'block',
    size: [7.4, 10.6, 4],
    radius: 1.8,
    glass: 'frosted',
    juice: '#e6eef2',
    cap: { shape: 'block', size: [3.6, 3.4, 3], finish: 'silver' },
    collar: 'silver',
    label: {
      lines: ['ACQUA DI', 'GIÒ', 'GIORGIO ARMANI'],
      ink: '#4a5560',
      font: 'serif',
      width: 0.7,
      height: 0.38,
      at: 0.6,
    },
  },
  'armani-acqua-di-gio-eau-de-parfum': {
    body: 'block',
    size: [7.4, 10.6, 4],
    radius: 1.8,
    glass: 'clear',
    juice: '#d99b2e',
    cap: { shape: 'block', size: [3.6, 3.4, 3], finish: 'black' },
    collar: 'gunmetal',
    label: {
      lines: ['ACQUA DI', 'GIÒ', 'GIORGIO ARMANI'],
      ink: '#2b1a06',
      font: 'serif',
      width: 0.7,
      height: 0.38,
      at: 0.6,
    },
  },
  'armani-stronger-with-you': {
    body: 'block',
    size: [7, 7.8, 4.2],
    radius: 1.6,
    glass: 'clear',
    juice: '#a5501c',
    cap: { shape: 'dome', size: [3.6, 3.6, 3.6], finish: 'gunmetal' },
    collar: 'gunmetal',
    label: {
      lines: ['STRONGER', 'WITH YOU'],
      ink: '#2b211c',
      font: 'sans',
      width: 0.6,
      height: 0.2,
      at: 0.66,
    },
  },

  // ---------- Calvin Klein ----------
  'calvin-klein-ck-one': {
    body: 'flask',
    size: [7.4, 11.4, 3.6],
    radius: 1.8,
    glass: 'frosted',
    juice: '#eef2f4',
    cap: { shape: 'cylinder', size: [2.6, 2.4, 2.6], finish: 'silver' },
    collar: 'silver',
    label: { lines: ['ck one'], ink: '#2f6fd8', font: 'sans', width: 0.5, height: 0.24, at: 0.55 },
  },
  'calvin-klein-ck-all': {
    body: 'flask',
    size: [7.4, 11.4, 3.6],
    radius: 1.8,
    glass: 'opaque',
    tint: '#f2f2ef',
    cap: { shape: 'cylinder', size: [2.6, 2.4, 2.6], finish: 'white' },
    collar: 'white',
    label: { lines: ['ck all'], ink: '#6c6c70', font: 'sans', width: 0.5, height: 0.24, at: 0.55 },
  },
  'calvin-klein-eternity': {
    body: 'block',
    size: [5, 12.4, 2.8],
    radius: 0.3,
    glass: 'clear',
    juice: '#f4f1e8',
    cap: { shape: 'block', size: [2.8, 3, 2.4], finish: 'silver' },
    collar: 'silver',
    label: {
      lines: ['ETERNITY'],
      ink: '#8a8d92',
      font: 'serif',
      width: 0.9,
      height: 0.12,
      at: 0.72,
    },
  },
};

/** A plain flacon, for anything new on the shelves before it has a spec. */
export const fallbackBottle: BottleSpec = {
  body: 'block',
  size: [7.2, 9.6, 3.6],
  radius: 0.6,
  glass: 'clear',
  juice: '#ead9b4',
  cap: { shape: 'block', size: [3.4, 3, 2.8], finish: 'gold' },
  collar: 'gold',
};
