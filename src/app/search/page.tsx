import type { Metadata, Route } from 'next';
import Form from 'next/form';
import Link from 'next/link';
import { SearchIcon } from '@/components/icons';
import { ProductGrid } from '@/components/product/ProductGrid';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { routes } from '@/content/routes';
import { getBrands, getProducts } from '@/lib/catalog';
import { MAX_QUERY_LENGTH, searchProducts } from '@/lib/search';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Perfume Hut by house, fragrance, note or family.',
  robots: { index: false },
};

const suggestions = ['Vanilla', 'Rose', 'Fresh', 'Dior', 'Chanel', 'For him'];

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (typeof q === 'string' ? q : '').trim().slice(0, MAX_QUERY_LENGTH);
  const [products, brands] = await Promise.all([getProducts(), getBrands()]);
  const results = query ? searchProducts(products, brands, query) : [];

  return (
    <PageTransition>
      <PageHeader eyebrow="Search" title={['Find your scent']}>
        {/* next/form: a plain GET form that navigates client-side when JS is available. */}
        <Form action={routes.search} className={styles.form} role="search">
          <label htmlFor="search-query" className="visually-hidden">
            Search fragrances
          </label>
          <input
            id="search-query"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Try “vanilla”, “Dior” or “fresh”"
            maxLength={MAX_QUERY_LENGTH}
            autoComplete="off"
            className={styles.input}
          />
          <button type="submit" className={styles.submit}>
            <SearchIcon className={styles.submitIcon} />
            <span className="visually-hidden">Search</span>
          </button>
        </Form>
        <ul className={styles.suggestions} aria-label="Popular searches">
          {suggestions.map((term) => (
            <li key={term}>
              <Link href={`${routes.search}?q=${encodeURIComponent(term)}` as Route}>{term}</Link>
            </li>
          ))}
        </ul>
      </PageHeader>

      <section className={styles.results} aria-live="polite" aria-label="Search results">
        {query &&
          (results.length > 0 ? (
            <>
              <p className={styles.count}>
                {results.length} {results.length === 1 ? 'result' : 'results'} for “{query}”
              </p>
              <ProductGrid products={results} eagerCount={4} />
            </>
          ) : (
            <p className={styles.count}>
              Nothing matches “{query}” yet. Try a note like “citrus” or{' '}
              <Link href={routes.shop}>browse every fragrance</Link>.
            </p>
          ))}
      </section>
    </PageTransition>
  );
}
