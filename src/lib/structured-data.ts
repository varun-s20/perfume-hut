import type { Brand, Product } from './catalog-types';
import { toDecimalString } from './money';
import { absoluteUrl, siteConfig } from './site';

type JsonLdNode = { '@type': string; [key: string]: unknown };

export type JsonLdDocument = {
  '@context': 'https://schema.org';
  '@graph': JsonLdNode[];
};

const document = (...nodes: JsonLdNode[]): JsonLdDocument => ({
  '@context': 'https://schema.org',
  '@graph': nodes,
});

const organizationId = () => absoluteUrl('/#organization');

export const productUrl = (product: Product) => absoluteUrl(`/products/${product.slug}`);

function productNode(product: Product, brandName: string): JsonLdNode {
  return {
    '@type': 'Product',
    '@id': `${productUrl(product)}#product`,
    name: `${brandName} ${product.name} ${product.concentration}`,
    description: product.description,
    image: absoluteUrl(product.image.src),
    brand: { '@type': 'Brand', name: brandName },
    category: 'Fragrance',
    offers: product.sizes.map((size) => ({
      '@type': 'Offer',
      name: `${size.ml} ml`,
      price: toDecimalString(size.price),
      priceCurrency: size.price.currency,
      availability: `https://schema.org/${product.availability}`,
      url: productUrl(product),
      seller: { '@id': organizationId() },
    })),
  };
}

export function buildSiteJsonLd(): JsonLdDocument {
  return document(
    {
      '@type': 'Organization',
      '@id': organizationId(),
      name: siteConfig.name,
      url: absoluteUrl('/'),
      logo: absoluteUrl('/icon.png'),
      email: siteConfig.email,
    },
    {
      '@type': 'WebSite',
      '@id': absoluteUrl('/#website'),
      name: siteConfig.name,
      url: absoluteUrl('/'),
      publisher: { '@id': organizationId() },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${absoluteUrl('/search')}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  );
}

export function buildProductJsonLd(product: Product, brand: Brand): JsonLdDocument {
  return document(
    productNode(product, brand.name),
    buildBreadcrumbNode([
      { name: 'Shop', path: '/shop' },
      { name: brand.name, path: `/brands/${brand.slug}` },
      { name: product.name, path: `/products/${product.slug}` },
    ]),
  );
}

export function buildItemListJsonLd(
  name: string,
  products: readonly Product[],
  brandNames: ReadonlyMap<string, string>,
): JsonLdDocument {
  return document({
    '@type': 'ItemList',
    name,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: productUrl(product),
      name: `${brandNames.get(product.brandSlug) ?? ''} ${product.name}`.trim(),
    })),
  });
}

function buildBreadcrumbNode(items: readonly { name: string; path: string }[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Serialises JSON-LD for an inline <script>. Escaping `<` prevents a value such as
 * `</script>` from closing the tag early.
 */
export function serializeJsonLd(data: JsonLdDocument): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
