import type { StaticImageData } from 'next/image';
import type { Money } from './money';

export type Availability = 'InStock' | 'OutOfStock' | 'PreOrder';

export const audiences = ['him', 'her', 'unisex'] as const;
export type Audience = (typeof audiences)[number];

export const families = ['fresh', 'floral', 'woody', 'amber', 'aromatic', 'gourmand'] as const;
export type Family = (typeof families)[number];

export type Concentration = 'Eau de Toilette' | 'Eau de Parfum' | 'Parfum';

export type Brand = {
  slug: string;
  name: string;
  tagline: string;
  story: string;
  image: StaticImageData;
  imageAlt: string;
  /** CSS object-position used when the photo is cropped to a banner. */
  imagePosition: string;
};

export type ProductSize = {
  ml: number;
  price: Money;
};

export type Product = {
  slug: string;
  brandSlug: string;
  name: string;
  concentration: Concentration;
  audience: Audience;
  family: Family;
  description: string;
  notes: {
    top: readonly string[];
    heart: readonly string[];
    base: readonly string[];
  };
  /** Ascending by volume. */
  sizes: readonly [ProductSize, ...ProductSize[]];
  availability: Availability;
  bestseller?: boolean;
  image: StaticImageData;
  imageAlt: string;
  imagePosition?: string;
};

export const audienceLabels: Record<Audience, string> = {
  him: 'For him',
  her: 'For her',
  unisex: 'Unisex',
};

export const familyLabels: Record<Family, string> = {
  fresh: 'Fresh',
  floral: 'Floral',
  woody: 'Woody',
  amber: 'Amber',
  aromatic: 'Aromatic',
  gourmand: 'Gourmand',
};
