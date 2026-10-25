import { describe, expect, it } from 'vitest';
import { products } from '@/data/products';
import { filterProducts, parseShopFilters, toShopQuery } from './shop';

const brandSlugs = ['versace', 'dior'];

describe('parseShopFilters', () => {
  it('accepts known values', () => {
    expect(
      parseShopFilters({ brand: 'dior', family: 'floral', for: 'her', sort: 'name' }, brandSlugs),
    ).toEqual({ brand: 'dior', family: 'floral', audience: 'her', sort: 'name' });
  });

  it('drops unknown or malicious values and defaults the sort', () => {
    expect(
      parseShopFilters(
        { brand: '<script>', family: 'smoky', for: 'pets', sort: 'random' },
        brandSlugs,
      ),
    ).toEqual({ brand: undefined, family: undefined, audience: undefined, sort: 'featured' });
  });

  it('uses the first value when a param repeats', () => {
    expect(parseShopFilters({ brand: ['versace', 'dior'] }, brandSlugs).brand).toBe('versace');
  });
});

describe('toShopQuery', () => {
  it('omits defaults and round-trips through the parser', () => {
    const filters = { brand: 'dior', audience: 'him' as const, sort: 'featured' as const };
    const query = toShopQuery(filters);
    expect(query).toBe('?brand=dior&for=him');
    const parsed = parseShopFilters(Object.fromEntries(new URLSearchParams(query)), brandSlugs);
    expect(parsed).toEqual({ ...filters, family: undefined });
  });

  it('returns an empty string when nothing is filtered', () => {
    expect(toShopQuery({ sort: 'featured' })).toBe('');
  });
});

describe('filterProducts', () => {
  it('combines filters with AND', () => {
    const result = filterProducts(products, { brand: 'dior', audience: 'her', sort: 'featured' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.brandSlug === 'dior' && p.audience === 'her')).toBe(true);
  });

  it('sorts by starting price in both directions', () => {
    const asc = filterProducts(products, { sort: 'price-asc' }).map((p) => p.sizes[0].price.amount);
    const desc = filterProducts(products, { sort: 'price-desc' }).map(
      (p) => p.sizes[0].price.amount,
    );
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it('puts bestsellers first by default without dropping anything', () => {
    const result = filterProducts(products, { sort: 'featured' });
    expect(result).toHaveLength(products.length);
    const firstNonBestseller = result.findIndex((p) => !p.bestseller);
    expect(result.slice(firstNonBestseller).some((p) => p.bestseller)).toBe(false);
  });

  it('does not mutate the input', () => {
    const before = products.map((p) => p.slug);
    filterProducts(products, { sort: 'name' });
    expect(products.map((p) => p.slug)).toEqual(before);
  });
});
