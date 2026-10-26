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

/** A few notes under each family's name, so you can choose by smell rather than by word. */
export const scentNotes: Record<Family, string> = {
  fresh: 'Citrus, water, green leaves',
  floral: 'Rose, jasmine, iris',
  woody: 'Cedar, sandalwood, vetiver',
  amber: 'Vanilla, resin, spice',
  aromatic: 'Lavender, herbs, woods',
  gourmand: 'Praline, caramel, vanilla',
};
