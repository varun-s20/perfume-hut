import { audienceLabels, type Brand, familyLabels, type Product } from './catalog-types';

export const MAX_QUERY_LENGTH = 80;

/** Lowercases and strips accents so "memoire" finds "Mémoire". */
function normalise(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Everything a product can be found by, normalised: house, name, family, audience and notes. */
export function searchText(product: Product, brandName: string): string {
  return normalise(
    [
      brandName,
      product.name,
      product.concentration,
      familyLabels[product.family],
      audienceLabels[product.audience],
      ...product.notes.top,
      ...product.notes.heart,
      ...product.notes.base,
    ].join(' '),
  );
}

/** The query as normalised terms; empty when there's nothing to search for. */
export function queryTerms(query: string): string[] {
  return normalise(query.slice(0, MAX_QUERY_LENGTH)).split(/\s+/).filter(Boolean);
}

/** Every term must appear somewhere in the text (from `searchText`). */
export function matchesTerms(text: string, terms: readonly string[]): boolean {
  return terms.length > 0 && terms.every((term) => text.includes(term));
}

/**
 * Every word in the query must appear somewhere in the product's brand, name,
 * family, audience or notes. Results keep catalogue order.
 */
export function searchProducts(
  products: readonly Product[],
  brands: readonly Brand[],
  query: string,
): readonly Product[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];

  const brandNames = new Map(brands.map((brand) => [brand.slug, brand.name]));
  return products.filter((product) =>
    matchesTerms(searchText(product, brandNames.get(product.brandSlug) ?? ''), terms),
  );
}
