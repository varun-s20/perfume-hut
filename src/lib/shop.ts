import {
  type Audience,
  audiences,
  type Concentration,
  type Family,
  families,
  type Product,
} from './catalog-types';

export const sortOptions = ['featured', 'price-asc', 'price-desc', 'name'] as const;
export type SortOption = (typeof sortOptions)[number];

export const sortLabels: Record<SortOption, string> = {
  featured: 'Featured',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  name: 'Name',
};

/** Price bands, by a bottle's starting price. */
export const priceBands = ['under-90', '90-120', '120-up'] as const;
export type PriceBand = (typeof priceBands)[number];

export const priceBandLabels: Record<PriceBand, string> = {
  'under-90': 'Under $90',
  '90-120': '$90 – $120',
  '120-up': '$120 and up',
};

/** Strength, by concentration. */
export const strengths = ['edt', 'edp', 'parfum'] as const;
export type Strength = (typeof strengths)[number];

export const strengthLabels: Record<Strength, string> = {
  edt: 'Eau de Toilette',
  edp: 'Eau de Parfum',
  parfum: 'Parfum',
};

const strengthOf: Record<Concentration, Strength> = {
  'Eau de Toilette': 'edt',
  'Eau de Parfum': 'edp',
  Parfum: 'parfum',
};

export function priceBandOf(cents: number): PriceBand {
  if (cents < 9000) return 'under-90';
  if (cents <= 12000) return '90-120';
  return '120-up';
}

/**
 * The shop's filters. Houses, families, prices and strengths can each take
 * several values (a bottle matches any of them); who it's for takes one.
 */
export type ShopFilters = {
  brands: readonly string[];
  families: readonly Family[];
  audience?: Audience;
  prices: readonly PriceBand[];
  strengths: readonly Strength[];
  sort: SortOption;
};

export type FilterGroup = 'brands' | 'families' | 'audience' | 'prices' | 'strengths';

export const noFilters: ShopFilters = {
  brands: [],
  families: [],
  prices: [],
  strengths: [],
  sort: 'featured',
};

/** What a bottle can be filtered by: small enough to filter and count in the browser too. */
export type Facets = {
  slug: string;
  brand: string;
  family: Family;
  audience: Audience;
  strength: Strength;
  price: PriceBand;
};

export function facetsOf(product: Product): Facets {
  return {
    slug: product.slug,
    brand: product.brandSlug,
    family: product.family,
    audience: product.audience,
    strength: strengthOf[product.concentration],
    price: priceBandOf(product.sizes[0].price.amount),
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

/** Every value of a param, whether repeated or comma-separated. */
function values(value: string | string[] | undefined): string[] {
  const all = Array.isArray(value) ? value : value ? [value] : [];
  return all.flatMap((item) => item.split(','));
}

/** The allowed values that appear, in their canonical order (so URLs stay stable). */
function allOf<T extends string>(value: string | string[] | undefined, allowed: readonly T[]): T[] {
  const given = new Set(values(value));
  return allowed.filter((option) => given.has(option));
}

function oneOf<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  return allowed.find((option) => option === values(value)[0]);
}

/** Parses untrusted URL params; unknown values are dropped rather than trusted. */
export function parseShopFilters(params: SearchParams, brandSlugs: readonly string[]): ShopFilters {
  return {
    brands: allOf(params.brand, brandSlugs),
    families: allOf(params.family, families),
    audience: oneOf(params.for, audiences),
    prices: allOf(params.price, priceBands),
    strengths: allOf(params.strength, strengths),
    sort: oneOf(params.sort, sortOptions) ?? 'featured',
  };
}

/** Serialises filters back to a query string, omitting defaults. */
export function toShopQuery(filters: ShopFilters): string {
  const params = new URLSearchParams();
  if (filters.brands.length) params.set('brand', filters.brands.join(','));
  if (filters.families.length) params.set('family', filters.families.join(','));
  if (filters.audience) params.set('for', filters.audience);
  if (filters.prices.length) params.set('price', filters.prices.join(','));
  if (filters.strengths.length) params.set('strength', filters.strengths.join(','));
  if (filters.sort !== 'featured') params.set('sort', filters.sort);
  // Commas read better in a shop URL than %2C.
  const query = params.toString().replaceAll('%2C', ',');
  return query ? `?${query}` : '';
}

/** Adds the value if it's missing, removes it if it's there; keeps the canonical order. */
export function toggled<T extends string>(list: readonly T[], value: T, order: readonly T[]): T[] {
  const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  return order.filter((option) => next.includes(option));
}

/** How many filters are on (not counting the sort). */
export function activeCount(filters: ShopFilters): number {
  return (
    filters.brands.length +
    filters.families.length +
    filters.prices.length +
    filters.strengths.length +
    (filters.audience ? 1 : 0)
  );
}

/** Whether a bottle passes the filters, optionally ignoring one group (for its counts). */
export function matches(item: Facets, filters: ShopFilters, except?: FilterGroup): boolean {
  const pass = (group: FilterGroup, ok: boolean) => group === except || ok;
  return (
    pass('brands', !filters.brands.length || filters.brands.includes(item.brand)) &&
    pass('families', !filters.families.length || filters.families.includes(item.family)) &&
    pass('audience', !filters.audience || filters.audience === item.audience) &&
    pass('prices', !filters.prices.length || filters.prices.includes(item.price)) &&
    pass('strengths', !filters.strengths.length || filters.strengths.includes(item.strength))
  );
}

export type FacetCounts = {
  brands: Record<string, number>;
  families: Record<string, number>;
  audience: Record<string, number>;
  prices: Record<string, number>;
  strengths: Record<string, number>;
};

/**
 * For every option, how many bottles you'd see if you picked it, given the
 * other groups as they stand. Within a group picks widen the results, so an
 * option's count ignores its own group's current picks.
 */
export function facetCounts(items: readonly Facets[], filters: ShopFilters): FacetCounts {
  const counts: FacetCounts = { brands: {}, families: {}, audience: {}, prices: {}, strengths: {} };
  const tally = (group: FilterGroup, key: string, item: Facets) => {
    if (matches(item, filters, group)) counts[group][key] = (counts[group][key] ?? 0) + 1;
  };
  for (const item of items) {
    tally('brands', item.brand, item);
    tally('families', item.family, item);
    tally('audience', item.audience, item);
    tally('audience', 'all', item);
    tally('prices', item.price, item);
    tally('strengths', item.strength, item);
  }
  return counts;
}

const startingAmount = (product: Product) => product.sizes[0].price.amount;

export function filterProducts(
  products: readonly Product[],
  filters: ShopFilters,
): readonly Product[] {
  const found = products.filter((product) => matches(facetsOf(product), filters));

  switch (filters.sort) {
    case 'price-asc':
      return [...found].sort((a, b) => startingAmount(a) - startingAmount(b));
    case 'price-desc':
      return [...found].sort((a, b) => startingAmount(b) - startingAmount(a));
    case 'name':
      return [...found].sort((a, b) => a.name.localeCompare(b.name));
    case 'featured':
      // Bestsellers first; otherwise keep catalogue (aisle) order.
      return [...found].sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller));
  }
}
