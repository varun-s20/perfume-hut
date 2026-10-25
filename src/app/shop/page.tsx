import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductGrid } from '@/components/product/ProductGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { shopUrl } from '@/components/shop/links';
import { ShopControls } from '@/components/shop/ShopControls';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { routes } from '@/content/routes';
import { shop } from '@/content/shop';
import { getBrands, getProducts } from '@/lib/catalog';
import { facetsOf, filterProducts, noFilters, parseShopFilters, strengths } from '@/lib/shop';
import { buildItemListJsonLd } from '@/lib/structured-data';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Shop all fragrances',
  description:
    'Browse every authentic designer fragrance at Perfume Hut. Filter by scent family, who it’s for, house, price or strength.',
  alternates: { canonical: '/shop' },
};

type ShopPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [params, brands, products] = await Promise.all([searchParams, getBrands(), getProducts()]);
  const filters = parseShopFilters(
    params,
    brands.map((brand) => brand.slug),
  );
  const results = filterProducts(products, filters);
  const items = products.map(facetsOf);
  const brandNames = new Map(brands.map((brand) => [brand.slug, brand.name]));
  // Only the strengths there's something in (no pure parfums yet, for instance).
  const inStock = strengths.filter((strength) => items.some((item) => item.strength === strength));

  return (
    <PageTransition>
      <JsonLd data={buildItemListJsonLd('All fragrances', results, brandNames)} />
      <PageHeader eyebrow={shop.eyebrow} title={[shop.title]} intro={shop.intro} />

      <div className={styles.shop}>
        <ShopControls
          filters={filters}
          items={items}
          houses={brands.map((brand) => ({ slug: brand.slug, name: brand.name }))}
          strengths={inStock}
          resultCount={results.length}
        >
          {results.length > 0 ? (
            <ProductGrid products={results} eagerCount={4} />
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>{shop.empty.title}</p>
              <p className={styles.emptyText}>{shop.empty.text}</p>
              <div className={styles.emptyActions}>
                <Link
                  href={shopUrl({ ...noFilters, sort: filters.sort })}
                  scroll={false}
                  className={styles.emptyReset}
                >
                  {shop.empty.reset}
                </Link>
                <Link href={routes.contact} className={styles.emptyAdvisor}>
                  {shop.empty.advisor}
                </Link>
              </div>
            </div>
          )}
        </ShopControls>
      </div>
    </PageTransition>
  );
}
