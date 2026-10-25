import type { Route } from 'next';
import { routes } from '@/content/routes';
import { type ShopFilters, toShopQuery } from '@/lib/shop';

/** A house as the filters list it. */
export type ShopHouse = { slug: string; name: string };

/** The shop with these filters on. */
export const shopUrl = (filters: ShopFilters) => `${routes.shop}${toShopQuery(filters)}` as Route;
