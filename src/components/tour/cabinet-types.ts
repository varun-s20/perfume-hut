import type { Route } from 'next';
import type { CabinetProduct } from '@/lib/ava';

/** A bottle on a cabinet shelf: what the shelf shows, plus what Ava reasons about. */
export type ShelfBottle = CabinetProduct & {
  href: Route;
  price: string;
};

/** One house's cabinet on the store floor. */
export type CabinetData = {
  slug: string;
  name: string;
  tagline: string;
  story: string;
  number: number;
  /** The lowest price in the cabinet, formatted. */
  fromPrice: string;
  bottles: readonly ShelfBottle[];
};
