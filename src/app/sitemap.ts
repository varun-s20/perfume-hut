import type { MetadataRoute } from 'next';
import { routes } from '@/content/routes';
import { getBrands, getProducts } from '@/lib/catalog';
import { absoluteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brands, products] = await Promise.all([getBrands(), getProducts()]);
  const lastModified = new Date();

  const pages = [
    { path: routes.home, priority: 1 },
    { path: routes.shop, priority: 0.9 },
    { path: routes.brands, priority: 0.8 },
    { path: routes.about, priority: 0.5 },
    { path: routes.contact, priority: 0.5 },
    { path: routes.faq, priority: 0.4 },
    { path: routes.shipping, priority: 0.4 },
  ];

  return [
    ...pages.map(({ path, priority }) => ({ url: absoluteUrl(path), lastModified, priority })),
    ...brands.map((brand) => ({
      url: absoluteUrl(`/brands/${brand.slug}`),
      lastModified,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified,
      priority: 0.7,
    })),
  ];
}
