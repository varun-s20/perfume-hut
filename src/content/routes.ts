import type { Route } from 'next';
import type { Audience, Family } from '@/lib/catalog-types';

export const routes = {
  home: '/',
  shop: '/shop',
  brands: '/brands',
  bag: '/bag',
  search: '/search',
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  shipping: '/shipping-returns',
} as const satisfies Record<string, Route>;

export const brandHref = (slug: string): Route => `/brands/${slug}` as Route;

export const productHref = (slug: string): Route => `/products/${slug}` as Route;

export const shopHref = (filters: { brand?: string; family?: Family; for?: Audience }): Route => {
  const params = new URLSearchParams();
  if (filters.brand) params.set('brand', filters.brand);
  if (filters.family) params.set('family', filters.family);
  if (filters.for) params.set('for', filters.for);
  const query = params.toString();
  return (query ? `/shop?${query}` : '/shop') as Route;
};
