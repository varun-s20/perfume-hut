import { describe, expect, it } from 'vitest';
import type { Brand, Product } from './catalog-types';
import { buildProductJsonLd, buildSiteJsonLd, serializeJsonLd } from './structured-data';

const image = { src: '/_next/static/media/test.jpg', width: 10, height: 10 };

const brand: Brand = {
  slug: 'test-house',
  name: 'Test House',
  tagline: '',
  story: '',
  image,
  imageAlt: 'Test',
  imagePosition: '50% 50%',
};

const product: Product = {
  slug: 'test-scent',
  brandSlug: 'test-house',
  name: 'Test Scent',
  concentration: 'Eau de Parfum',
  audience: 'unisex',
  family: 'fresh',
  description: 'A test.',
  notes: { top: ['Lemon'], heart: ['Rose'], base: ['Musk'] },
  sizes: [
    { ml: 50, price: { amount: 5599, currency: 'USD' } },
    { ml: 100, price: { amount: 9900, currency: 'USD' } },
  ],
  availability: 'InStock',
  image,
  imageAlt: 'Test bottle',
};

describe('buildProductJsonLd', () => {
  const graph = buildProductJsonLd(product, brand)['@graph'];
  const node = graph.find((n) => n['@type'] === 'Product');

  it('emits one offer per size with decimal prices and absolute URLs', () => {
    expect(node).toMatchObject({
      name: 'Test House Test Scent Eau de Parfum',
      image: expect.stringMatching(/^https?:\/\/.+\/_next\/static\/media\/test\.jpg$/),
      offers: [
        { name: '50 ml', price: '55.99', priceCurrency: 'USD' },
        { name: '100 ml', price: '99.00', priceCurrency: 'USD' },
      ],
    });
  });

  it('includes a breadcrumb trail ending at the product', () => {
    const breadcrumb = graph.find((n) => n['@type'] === 'BreadcrumbList');
    const items = breadcrumb?.itemListElement as { name: string }[];
    expect(items.map((item) => item.name)).toEqual(['Shop', 'Test House', 'Test Scent']);
  });
});

describe('buildSiteJsonLd', () => {
  it('declares a site search action', () => {
    const website = buildSiteJsonLd()['@graph'].find((n) => n['@type'] === 'WebSite');
    expect(website?.potentialAction).toMatchObject({ '@type': 'SearchAction' });
  });
});

describe('serializeJsonLd', () => {
  it('escapes angle brackets so the script tag cannot be closed early', () => {
    const output = serializeJsonLd(buildProductJsonLd({ ...product, name: '</script>' }, brand));
    expect(output).not.toContain('</script>');
    expect(output).toContain('\\u003c/script>');
  });
});
