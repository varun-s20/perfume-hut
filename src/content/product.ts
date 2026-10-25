import type { Audience, Concentration, Family } from '@/lib/catalog-types';

/*
 * The words around a product page. Family and concentration notes are the
 * general character of each kind of fragrance, not claims about one bottle.
 */

export const productPage = {
  views: { photo: 'Photograph', model: 'In 3D' },
  turnHint: 'Drag to turn the bottle',
  aisle: (number: number) => `Aisle ${String(number).padStart(2, '0')}`,
  glance: 'At a glance',
  assurances: [
    { icon: 'seal', text: 'Authentic, sealed retail bottle' },
    { icon: 'box', text: 'Packed by hand, tracked to your door' },
    { icon: 'return', text: 'Returns on unopened bottles within 30 days' },
  ],
  advisor: { lead: 'Not sure it’s the one?', label: 'Ask an advisor' },
  unfolds: {
    eyebrow: 'The notes',
    title: 'How it unfolds',
    tiers: [
      { key: 'top', label: 'Top notes', timing: 'The first 15 minutes' },
      { key: 'heart', label: 'Heart notes', timing: 'The first few hours' },
      { key: 'base', label: 'Base notes', timing: 'Into the dry-down' },
    ],
  },
  character: {
    eyebrow: 'The character',
    title: 'What it’s like to wear',
    family: 'Family',
    strength: 'Strength',
    wearer: 'Worn by',
  },
  house: {
    eyebrow: 'From the house',
    visit: (house: string) => `Visit the ${house} aisle`,
  },
  details: 'The details',
  related: 'More from the floor',
  sticky: (price: string) => `Add to bag · ${price}`,
} as const;

export const familyNotes: Record<Family, string> = {
  fresh: 'Citrus, water and green leaves: clean, bright and easy to wear.',
  floral: 'A bouquet at its heart: rose, jasmine, iris and white flowers.',
  woody: 'Cedar, sandalwood and vetiver: dry, grounded and quietly warm.',
  amber: 'Vanilla, resins and spice: rich, warm and close to the skin.',
  aromatic: 'Herbs and lavender over woods: fresh at first, then smooth.',
  gourmand: 'Notes you could almost taste: vanilla, praline and caramel.',
};

/** Strength on a scale of four, and how it typically wears. */
export const concentrationNotes: Record<Concentration, { strength: number; text: string }> = {
  'Eau de Toilette': {
    strength: 2,
    text: 'Lighter and brighter. Typically four to six hours on skin.',
  },
  'Eau de Parfum': {
    strength: 3,
    text: 'Richer and deeper. Typically six to eight hours on skin.',
  },
  Parfum: { strength: 4, text: 'The most concentrated. Typically eight hours or more.' },
};

export const audienceNotes: Record<Audience, string> = {
  him: 'Made for him, worn by anyone who loves it.',
  her: 'Made for her, worn by anyone who loves it.',
  unisex: 'Made to be shared, on anyone.',
};
