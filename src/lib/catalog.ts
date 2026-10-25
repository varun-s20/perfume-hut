import { brands } from '@/data/brands';
import { products } from '@/data/products';
import type { Brand, Product } from './catalog-types';
import type { Money } from './money';

export type { Brand, Product } from './catalog-types';

/*
 * Data access for the storefront. Functions are async on purpose: the static
 * catalog can be replaced by the live inventory feed (Whatnot / TikTok Shop)
 * without touching any component that consumes it.
 */

export async function getBrands(): Promise<readonly Brand[]> {
  return brands;
}

export async function getBrand(slug: string): Promise<Brand | undefined> {
  return brands.find((brand) => brand.slug === slug);
}

export async function getProducts(): Promise<readonly Product[]> {
  return products;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return products.find((product) => product.slug === slug);
}

export async function getProductsByBrand(brandSlug: string): Promise<readonly Product[]> {
  return products.filter((product) => product.brandSlug === brandSlug);
}

export async function getBestsellers(limit = 3): Promise<readonly Product[]> {
  return products.filter((product) => product.bestseller).slice(0, limit);
}

/** Products in the order given; unknown slugs are skipped. */
export async function getProductsBySlugs(slugs: readonly string[]): Promise<readonly Product[]> {
  return slugs.flatMap((slug) => products.find((product) => product.slug === slug) ?? []);
}

/** Same brand first, then the same fragrance family, never the product itself. */
export async function getRelatedProducts(product: Product, limit = 4): Promise<readonly Product[]> {
  const others = products.filter((candidate) => candidate.slug !== product.slug);
  const sameBrand = others.filter((candidate) => candidate.brandSlug === product.brandSlug);
  const sameFamily = others.filter(
    (candidate) => candidate.brandSlug !== product.brandSlug && candidate.family === product.family,
  );
  return [...sameBrand, ...sameFamily].slice(0, limit);
}

/** Aisle numbers follow the store layout order, starting at 1. */
export function getAisleNumber(brandSlug: string): number {
  return brands.findIndex((brand) => brand.slug === brandSlug) + 1;
}

/** Neighbouring aisles, wrapping around so the walk never dead-ends. */
export function getAdjacentBrands(brandSlug: string): { previous: Brand; next: Brand } {
  const index = brands.findIndex((brand) => brand.slug === brandSlug);
  const at = (offset: number) => brands[(index + offset + brands.length) % brands.length] as Brand;
  return { previous: at(-1), next: at(1) };
}

export function countProductsByBrand(): Record<string, number> {
  return products.reduce<Record<string, number>>((counts, product) => {
    counts[product.brandSlug] = (counts[product.brandSlug] ?? 0) + 1;
    return counts;
  }, {});
}

/** The lowest price across a product's sizes, for "from $X" labels. */
export function getStartingPrice(product: Product): Money {
  return product.sizes[0].price;
}

export function getBrandName(brandSlug: string): string {
  return brands.find((brand) => brand.slug === brandSlug)?.name ?? '';
}
