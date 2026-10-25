import Link from 'next/link';
import { brandHref } from '@/content/routes';
import type { Brand } from '@/lib/catalog';
import styles from './BrandMarquee.module.css';

/**
 * A slow, continuous ribbon of the houses on our shelves. Constant motion uses
 * linear timing; it pauses on hover and stops entirely for reduced motion.
 */
export function BrandMarquee({ brands }: { brands: readonly Brand[] }) {
  const items = brands.map((brand) => (
    <li key={brand.slug}>
      <Link href={brandHref(brand.slug)} transitionTypes={['walk-in']} className={styles.item}>
        {brand.name}
      </Link>
    </li>
  ));

  return (
    <nav className={styles.marquee} aria-label="Brands on our shelves">
      <div className={styles.track}>
        <ul className={styles.list}>{items}</ul>
        {/* The duplicate makes the loop seamless; it is hidden from assistive tech. */}
        <ul className={styles.list} aria-hidden="true" inert>
          {items}
        </ul>
      </div>
    </nav>
  );
}
