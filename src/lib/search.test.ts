import { describe, expect, it } from 'vitest';
import { brands } from '@/data/brands';
import { products } from '@/data/products';
import { searchProducts } from './search';

const search = (query: string) => searchProducts(products, brands, query);
const allNotes = (p: (typeof products)[number]) =>
  [...p.notes.top, ...p.notes.heart, ...p.notes.base].join(' ').toLowerCase();

describe('searchProducts', () => {
  it('matches by brand name', () => {
    const results = search('chanel');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.brandSlug === 'chanel')).toBe(true);
  });

  it('requires every term to match', () => {
    const results = search('dior vanilla');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.brandSlug === 'dior' && allNotes(p).includes('vanilla'))).toBe(
      true,
    );
  });

  it('ignores case and accents', () => {
    expect(search('SAUVAGE').map((p) => p.slug)).toEqual(['dior-sauvage-eau-de-parfum']);
    expect(search('memoire').map((p) => p.slug)).toEqual(['gucci-memoire-dune-odeur']);
  });

  it('returns nothing for blank queries', () => {
    expect(search('   ')).toEqual([]);
  });
});
