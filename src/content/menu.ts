import type { Route } from 'next';
import { routes, shopHref } from './routes';

/** The phone menu: where to go, ways in to the shelves, and the aisles. */
export const menu = {
  label: 'Menu',
  search: 'Search a house, a bottle or a note',
  primary: [
    { label: 'Shop all fragrances', href: routes.shop },
    { label: 'The houses', href: routes.brands },
    { label: 'Take the store tour', href: routes.home },
    { label: 'Our story', href: routes.about },
    { label: 'Talk to an advisor', href: routes.contact },
  ],
  shopBy: {
    title: 'Shop by',
    links: [
      { label: 'For him', href: shopHref({ for: 'him' }) },
      { label: 'For her', href: shopHref({ for: 'her' }) },
      { label: 'Unisex', href: shopHref({ for: 'unisex' }) },
      { label: 'Fresh', href: shopHref({ family: 'fresh' }) },
      { label: 'Floral', href: shopHref({ family: 'floral' }) },
      { label: 'Woody', href: shopHref({ family: 'woody' }) },
      { label: 'Amber', href: shopHref({ family: 'amber' }) },
    ],
  },
  aisles: {
    title: 'The aisles',
    all: 'All houses',
    number: (aisle: number) => `Aisle ${String(aisle).padStart(2, '0')}`,
  },
  live: {
    title: 'Live on Whatnot & TikTok Shop',
    text: 'Same shelves, same sealed bottles, live.',
  },
  help: [
    { label: 'FAQ', href: routes.faq },
    { label: 'Shipping & returns', href: routes.shipping },
  ],
} as const satisfies {
  primary: readonly { label: string; href: Route }[];
  shopBy: { title: string; links: readonly { label: string; href: Route }[] };
  help: readonly { label: string; href: Route }[];
} & Record<string, unknown>;
