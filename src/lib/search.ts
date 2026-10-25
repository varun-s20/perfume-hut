import { audienceLabels, type Brand, familyLabels, type Product } from './catalog-types';

export const MAX_QUERY_LENGTH = 80;

/** Lowercases and strips accents so "memoire" finds "Mémoire". */
function normalise(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function haystack(product: Product, brandName: string): string {
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

/**
 * Every word in the query must appear somewhere in the product's brand, name,
 * family, audience or notes. Results keep catalogue order.
 */
export function searchProducts(
  products: readonly Product[],
  brands: readonly Brand[],
  query: string,
): readonly Product[] {
  const terms = normalise(query.slice(0, MAX_QUERY_LENGTH)).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const brandNames = new Map(brands.map((brand) => [brand.slug, brand.name]));
  return products.filter((product) => {
    const text = haystack(product, brandNames.get(product.brandSlug) ?? '');
    return terms.every((term) => text.includes(term));
  });
}
