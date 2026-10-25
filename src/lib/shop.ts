import { type Audience, audiences, type Family, families, type Product } from './catalog-types';

export const sortOptions = ['featured', 'price-asc', 'price-desc', 'name'] as const;
export type SortOption = (typeof sortOptions)[number];

export const sortLabels: Record<SortOption, string> = {
  featured: 'Featured',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  name: 'Name',
};

export type ShopFilters = {
  brand?: string;
  family?: Family;
  audience?: Audience;
  sort: SortOption;
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.find((option) => option === value);
}

/** Parses untrusted URL params; unknown values are dropped rather than trusted. */
export function parseShopFilters(params: SearchParams, brandSlugs: readonly string[]): ShopFilters {
  return {
    brand: oneOf(first(params.brand), brandSlugs),
    family: oneOf(first(params.family), families),
    audience: oneOf(first(params.for), audiences),
    sort: oneOf(first(params.sort), sortOptions) ?? 'featured',
  };
}

/** Serialises filters back to a query string, omitting defaults. */
export function toShopQuery(filters: ShopFilters): string {
  const params = new URLSearchParams();
  if (filters.brand) params.set('brand', filters.brand);
  if (filters.family) params.set('family', filters.family);
  if (filters.audience) params.set('for', filters.audience);
  if (filters.sort !== 'featured') params.set('sort', filters.sort);
  const query = params.toString();
  return query ? `?${query}` : '';
}

const startingAmount = (product: Product) => product.sizes[0].price.amount;

export function filterProducts(
  products: readonly Product[],
  filters: ShopFilters,
): readonly Product[] {
  const matches = products.filter(
    (product) =>
      (!filters.brand || product.brandSlug === filters.brand) &&
      (!filters.family || product.family === filters.family) &&
      (!filters.audience || product.audience === filters.audience),
  );

  switch (filters.sort) {
    case 'price-asc':
      return [...matches].sort((a, b) => startingAmount(a) - startingAmount(b));
    case 'price-desc':
      return [...matches].sort((a, b) => startingAmount(b) - startingAmount(a));
    case 'name':
      return [...matches].sort((a, b) => a.name.localeCompare(b.name));
    case 'featured':
      // Bestsellers first; otherwise keep catalogue (aisle) order.
      return [...matches].sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller));
  }
}
