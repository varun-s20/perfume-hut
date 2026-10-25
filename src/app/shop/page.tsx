import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { ProductGrid } from '@/components/product/ProductGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { routes } from '@/content/routes';
import { getBrands, getProducts } from '@/lib/catalog';
import {
  type Audience,
  audienceLabels,
  audiences,
  type Family,
  families,
  familyLabels,
} from '@/lib/catalog-types';
import { cx } from '@/lib/cx';
import {
  filterProducts,
  parseShopFilters,
  type ShopFilters,
  sortLabels,
  sortOptions,
  toShopQuery,
} from '@/lib/shop';
import { buildItemListJsonLd } from '@/lib/structured-data';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Shop all fragrances',
  description:
    'Browse every authentic designer fragrance at Perfume Hut. Filter by house, fragrance family or who it’s for.',
  alternates: { canonical: '/shop' },
};

type ShopPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const hrefFor = (filters: ShopFilters) => `${routes.shop}${toShopQuery(filters)}` as Route;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [params, brands, products] = await Promise.all([searchParams, getBrands(), getProducts()]);
  const filters = parseShopFilters(
    params,
    brands.map((brand) => brand.slug),
  );
  const results = filterProducts(products, filters);
  const brandNames = new Map(brands.map((brand) => [brand.slug, brand.name]));
  const isFiltered = Boolean(filters.brand || filters.family || filters.audience);

  // Toggle a single filter while keeping the others (and the sort).
  const toggle = <K extends 'brand' | 'family' | 'audience'>(key: K, value: ShopFilters[K]) =>
    hrefFor({ ...filters, [key]: filters[key] === value ? undefined : value });

  const groups = [
    {
      title: 'For',
      options: audiences.map((value: Audience) => ({
        label: audienceLabels[value],
        href: toggle('audience', value),
        active: filters.audience === value,
      })),
    },
    {
      title: 'Family',
      options: families.map((value: Family) => ({
        label: familyLabels[value],
        href: toggle('family', value),
        active: filters.family === value,
      })),
    },
    {
      title: 'House',
      options: brands.map((brand) => ({
        label: brand.name,
        href: toggle('brand', brand.slug),
        active: filters.brand === brand.slug,
      })),
    },
  ];

  return (
    <PageTransition>
      <JsonLd data={buildItemListJsonLd('All fragrances', results, brandNames)} />
      <PageHeader
        eyebrow="The shop floor"
        title={['All fragrances']}
        intro="Every bottle on our shelves, sealed and authentic. Narrow it down by who it’s for, the fragrance family you love, or the house."
      />

      <div className={styles.layout}>
        <aside className={styles.filters} aria-label="Filters">
          {groups.map((group) => (
            <div key={group.title} className={styles.group}>
              <h2 className={styles.groupTitle}>{group.title}</h2>
              <ul className={styles.options}>
                {group.options.map((option) => (
                  <li key={option.label}>
                    <Link
                      href={option.href}
                      scroll={false}
                      transitionTypes={['filter']}
                      aria-current={option.active ? 'true' : undefined}
                      className={cx(styles.option, option.active && styles.optionActive)}
                    >
                      {option.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {isFiltered && (
            <Link
              href={hrefFor({ sort: filters.sort })}
              scroll={false}
              transitionTypes={['filter']}
              className={styles.clear}
            >
              Clear filters
            </Link>
          )}
        </aside>

        <section className={styles.results} aria-labelledby="results-heading">
          <div className={styles.toolbar}>
            <h2 id="results-heading" className={styles.count} aria-live="polite">
              {results.length} {results.length === 1 ? 'fragrance' : 'fragrances'}
            </h2>
            <nav className={styles.sort} aria-label="Sort">
              {sortOptions.map((option) => (
                <Link
                  key={option}
                  href={hrefFor({ ...filters, sort: option })}
                  scroll={false}
                  transitionTypes={['filter']}
                  aria-current={filters.sort === option ? 'true' : undefined}
                  className={cx(styles.sortLink, filters.sort === option && styles.sortActive)}
                >
                  {sortLabels[option]}
                </Link>
              ))}
            </nav>
          </div>

          {results.length > 0 ? (
            <ProductGrid products={results} eagerCount={4} columns={3} />
          ) : (
            <div className={styles.empty}>
              <p>Nothing on the shelf matches that combination yet.</p>
              <Link href={routes.shop} className={styles.clear}>
                See everything
              </Link>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
