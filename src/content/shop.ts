import type { Family } from '@/lib/catalog-types';

/** The shop page: its header, the scent families and the filter controls. */
export const shop = {
  eyebrow: 'The shop floor',
  title: 'All fragrances',
  intro:
    'Every bottle on our shelves, sealed and authentic. Start with how you like to smell, then narrow it down by house, price or strength.',
  families: {
    title: 'Shop by scent',
    hint: 'Choose one or more',
  },
  groups: {
    audience: 'Who it’s for',
    brands: 'House',
    prices: 'Price',
    strengths: 'Strength',
    families: 'Scent',
  },
  all: 'Everyone',
  sort: 'Sort',
  filter: 'Filter',
  clear: 'Clear all',
  results: (count: number) => `${count} ${count === 1 ? 'fragrance' : 'fragrances'}`,
  show: (count: number) =>
    count === 0
      ? 'Nothing matches yet'
      : `Show ${count} ${count === 1 ? 'fragrance' : 'fragrances'}`,
  remove: (label: string) => `Remove ${label}`,
  empty: {
    title: 'Nothing on the shelf matches that yet.',
    text: 'Try taking a filter off, or ask an advisor: we can often find a bottle that isn’t on the shelves.',
    reset: 'See everything',
    advisor: 'Ask an advisor',
  },
};

/**
 * Each family as a swatch of colour, the way it smells, and a few of its
 * notes, so you can choose by feel rather than by name.
 */
export const familySwatches: Record<Family, { colours: [string, string]; notes: string }> = {
  fresh: { colours: ['#e4f2ec', '#8fc9bd'], notes: 'Citrus, water, green' },
  floral: { colours: ['#f8e1e4', '#e29fae'], notes: 'Rose, jasmine, iris' },
  woody: { colours: ['#efe2d2', '#a27b58'], notes: 'Cedar, sandalwood' },
  amber: { colours: ['#f7e0b4', '#c97b34'], notes: 'Vanilla, resin, spice' },
  aromatic: { colours: ['#e7e4f1', '#9a8fbf'], notes: 'Lavender, herbs' },
  gourmand: { colours: ['#f4e2cf', '#a8673f'], notes: 'Praline, caramel' },
};
