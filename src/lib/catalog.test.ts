import { describe, expect, it } from 'vitest';
import {
  getAdjacentBrands,
  getAisleNumber,
  getBrands,
  getProducts,
  getRelatedProducts,
} from './catalog';

describe('catalogue integrity', () => {
  it('uses unique product and brand slugs', async () => {
    const products = await getProducts();
    const brands = await getBrands();
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
    expect(new Set(brands.map((b) => b.slug)).size).toBe(brands.length);
  });

  it('links every product to a known brand and every brand to products', async () => {
    const products = await getProducts();
    const brandSlugs = new Set((await getBrands()).map((b) => b.slug));
    for (const product of products) expect(brandSlugs.has(product.brandSlug)).toBe(true);
    for (const slug of brandSlugs) expect(products.some((p) => p.brandSlug === slug)).toBe(true);
  });

  it('stores sizes in ascending order with positive integer prices', async () => {
    for (const product of await getProducts()) {
      const volumes = product.sizes.map((s) => s.ml);
      expect(volumes).toEqual([...volumes].sort((a, b) => a - b));
      for (const { price } of product.sizes) {
        expect(Number.isInteger(price.amount)).toBe(true);
        expect(price.amount).toBeGreaterThan(0);
      }
    }
  });

  it('describes every image for assistive technology', async () => {
    for (const product of await getProducts()) expect(product.imageAlt.trim()).not.toBe('');
    for (const brand of await getBrands()) expect(brand.imageAlt.trim()).not.toBe('');
  });
});

describe('aisles', () => {
  it('numbers aisles from 1 in store order', async () => {
    const [first] = await getBrands();
    expect(getAisleNumber(first!.slug)).toBe(1);
  });

  it('wraps around at both ends of the store', async () => {
    const brands = await getBrands();
    const first = brands[0]!;
    const last = brands[brands.length - 1]!;
    expect(getAdjacentBrands(first.slug).previous.slug).toBe(last.slug);
    expect(getAdjacentBrands(last.slug).next.slug).toBe(first.slug);
  });
});

describe('getRelatedProducts', () => {
  it('never recommends the product itself and prefers the same brand', async () => {
    const [product] = await getProducts();
    const related = await getRelatedProducts(product!, 4);
    expect(related.some((p) => p.slug === product!.slug)).toBe(false);
    expect(related[0]?.brandSlug).toBe(product!.brandSlug);
  });
});
