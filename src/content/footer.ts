import type { Route } from 'next';
import blouse from '@/assets/images/editorial/blouse.jpg';
import cocoTray from '@/assets/images/editorial/coco-tray.jpg';
import type { ContentImage } from './home';
import { brandHref, routes, shopHref } from './routes';

export type FooterLinkGroup = {
  /** Accessible name for the group's <nav> landmark. */
  name: string;
  title: string;
  links: readonly { label: string; href: Route }[];
};

export const footer = {
  heading: ['Notes often arrive gradually,', 'not all at once.'],
  brand: {
    title: 'Perfume Hut',
    text: ['Authentic designer fragrance,', 'curated by people who know', 'the counter.'],
  },
  linkGroups: [
    {
      name: 'Shop',
      title: '01 - Shop',
      links: [
        { label: 'All fragrances', href: routes.shop },
        { label: 'For him', href: shopHref({ for: 'him' }) },
        { label: 'For her', href: shopHref({ for: 'her' }) },
        { label: 'Unisex', href: shopHref({ for: 'unisex' }) },
      ],
    },
    {
      name: 'Brands',
      title: '02 - Brands',
      links: [
        { label: 'Dior', href: brandHref('dior') },
        { label: 'Chanel', href: brandHref('chanel') },
        { label: 'Versace', href: brandHref('versace') },
        { label: 'All brands', href: routes.brands },
      ],
    },
    {
      name: 'Help',
      title: '03 - Help',
      links: [
        { label: 'Shipping & returns', href: routes.shipping },
        { label: 'FAQ', href: routes.faq },
        { label: 'Contact us', href: routes.contact },
        { label: 'About us', href: routes.about },
      ],
    },
  ],
  newsletter: {
    title: 'Stay in the know',
    text: ['Restocks, rare finds and', 'members-only drops,', 'straight to your inbox.'],
  },
  showcase: {
    images: [
      { src: cocoTray, alt: 'Coco Mademoiselle on a vintage vanity tray' },
      { src: blouse, alt: 'A woman in a silk blouse holding a perfume bottle' },
    ],
    text: ['Can’t decide? Our advisors', 'will help you find your', 'signature.'],
    cta: { label: 'Ask an Advisor', href: routes.contact },
  },
} as const satisfies {
  heading: readonly string[];
  brand: { title: string; text: readonly string[] };
  linkGroups: readonly FooterLinkGroup[];
  newsletter: { title: string; text: readonly string[] };
  showcase: {
    images: readonly [ContentImage, ContentImage];
    text: readonly string[];
    cta: { label: string; href: Route };
  };
};
