import { describe, expect, it } from 'vitest';
import { products } from '@/data/products';
import {
  activeCount,
  facetCounts,
  facetsOf,
  filterProducts,
  noFilters,
  parseShopFilters,
  priceBandOf,
  toggled,
  toShopQuery,
} from './shop';

const brandSlugs = ['versace', 'dior', 'chanel'];
const items = products.map(facetsOf);

describe('parseShopFilters', () => {
  it('accepts known values, singly or as comma lists', () => {
    expect(
      parseShopFilters(
        {
          brand: 'dior,chanel',
          family: 'floral',
          for: 'her',
          price: '90-120',
          strength: 'edp',
          sort: 'name',
        },
        brandSlugs,
      ),
    ).toEqual({
      brands: ['dior', 'chanel'],
      families: ['floral'],
      audience: 'her',
      prices: ['90-120'],
      strengths: ['edp'],
      sort: 'name',
    });
  });

  it('drops unknown or malicious values and defaults the sort', () => {
    expect(
      parseShopFilters(
        { brand: '<script>', family: 'smoky', for: 'pets', price: 'free', sort: 'random' },
        brandSlugs,
      ),
    ).toEqual(noFilters);
  });

  it('keeps a canonical order and no duplicates, from repeats or lists', () => {
    const parsed = parseShopFilters({ brand: ['chanel', 'versace', 'chanel'] }, brandSlugs);
    expect(parsed.brands).toEqual(['versace', 'chanel']);
  });

  it('reads the single-value links the rest of the site makes', () => {
    expect(parseShopFilters({ family: 'fresh', for: 'him' }, brandSlugs)).toMatchObject({
      families: ['fresh'],
      audience: 'him',
    });
  });
});

describe('toShopQuery', () => {
  it('omits defaults, joins lists with commas and round-trips through the parser', () => {
    const filters = { ...noFilters, brands: ['dior', 'chanel'], audience: 'him' as const };
    const query = toShopQuery(filters);
    expect(query).toBe('?brand=dior,chanel&for=him');
    const parsed = parseShopFilters(Object.fromEntries(new URLSearchParams(query)), brandSlugs);
    expect(parsed).toEqual({ ...filters, brands: ['dior', 'chanel'] });
  });

  it('returns an empty string when nothing is filtered', () => {
    expect(toShopQuery(noFilters)).toBe('');
  });
});

describe('toggled', () => {
  it('adds and removes, keeping the canonical order', () => {
    const order = ['a', 'b', 'c'];
    expect(toggled(['c'], 'a', order)).toEqual(['a', 'c']);
    expect(toggled(['a', 'c'], 'a', order)).toEqual(['c']);
  });
});

describe('priceBandOf', () => {
  it('bands by starting price', () => {
    expect(priceBandOf(8900)).toBe('under-90');
    expect(priceBandOf(9000)).toBe('90-120');
    expect(priceBandOf(12000)).toBe('90-120');
    expect(priceBandOf(12100)).toBe('120-up');
  });
});

describe('filterProducts', () => {
  it('combines groups with AND, and values within a group with OR', () => {
    const result = filterProducts(products, {
      ...noFilters,
      brands: ['dior', 'chanel'],
      audience: 'her',
    });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((p) => ['dior', 'chanel'].includes(p.brandSlug) && p.audience === 'her'),
    ).toBe(true);
    expect(new Set(result.map((p) => p.brandSlug)).size).toBe(2);
  });

  it('filters by price band and strength', () => {
    const result = filterProducts(products, {
      ...noFilters,
      prices: ['under-90'],
      strengths: ['edt'],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((p) => p.sizes[0].price.amount < 9000 && p.concentration === 'Eau de Toilette'),
    ).toBe(true);
  });

  it('sorts by starting price in both directions', () => {
    const asc = filterProducts(products, { ...noFilters, sort: 'price-asc' }).map(
      (p) => p.sizes[0].price.amount,
    );
    const desc = filterProducts(products, { ...noFilters, sort: 'price-desc' }).map(
      (p) => p.sizes[0].price.amount,
    );
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it('puts bestsellers first by default without dropping anything', () => {
    const result = filterProducts(products, noFilters);
    expect(result).toHaveLength(products.length);
    const firstNonBestseller = result.findIndex((p) => !p.bestseller);
    expect(result.slice(firstNonBestseller).some((p) => p.bestseller)).toBe(false);
  });

  it('does not mutate the input', () => {
    const before = products.map((p) => p.slug);
    filterProducts(products, { ...noFilters, sort: 'name' });
    expect(products.map((p) => p.slug)).toEqual(before);
  });
});

describe('facetCounts', () => {
  it('counts the whole shelf when nothing is picked', () => {
    const counts = facetCounts(items, noFilters);
    expect(counts.audience.all).toBe(products.length);
    const families = Object.values(counts.families).reduce((sum, n) => sum + n, 0);
    expect(families).toBe(products.length);
  });

  it('counts each option as if you picked it, given the other groups', () => {
    const filters = { ...noFilters, families: ['floral' as const], audience: 'her' as const };
    const counts = facetCounts(items, filters);
    // A house's count respects the family and audience picks...
    const diorFloralHer = products.filter(
      (p) => p.brandSlug === 'dior' && p.family === 'floral' && p.audience === 'her',
    ).length;
    expect(counts.brands.dior ?? 0).toBe(diorFloralHer);
    // ...while another family's count ignores the family pick (it would widen it).
    const freshHer = products.filter((p) => p.family === 'fresh' && p.audience === 'her').length;
    expect(counts.families.fresh ?? 0).toBe(freshHer);
  });
});

describe('activeCount', () => {
  it('counts every pick but not the sort', () => {
    expect(activeCount({ ...noFilters, sort: 'name' })).toBe(0);
    expect(
      activeCount({
        ...noFilters,
        brands: ['dior', 'chanel'],
        audience: 'him',
        prices: ['120-up'],
      }),
    ).toBe(4);
  });
});
