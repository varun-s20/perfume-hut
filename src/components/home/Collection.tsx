import { ButtonLink } from '@/components/ui/ButtonLink';
import { EyebrowPill } from '@/components/ui/EyebrowPill';
import { Lines } from '@/components/ui/Lines';
import { bestsellers } from '@/content/home';
import type { Product } from '@/lib/catalog';
import { cx } from '@/lib/cx';
import styles from './Collection.module.css';
import { FeaturedProductCard } from './FeaturedProductCard';

/** The layout is designed around one featured product and two supporting ones. */
const FEATURED_COUNT = 3;

type CollectionProps = {
  products: readonly Product[];
};

export function Collection({ products }: CollectionProps) {
  const featured = products.slice(0, FEATURED_COUNT);

  return (
    <section id="bestsellers" className={styles.collection} aria-labelledby="collection-heading">
      <header className={cx(styles.intro, 'reveal')}>
        <EyebrowPill label="Bestsellers" />
        <h2 id="collection-heading" className={styles.heading}>
          <Lines lines={bestsellers.heading} />
        </h2>
      </header>

      <div className={styles.grid}>
        {featured.map((product, index) => (
          <FeaturedProductCard
            key={product.slug}
            product={product}
            position={index + 1}
            featured={index === 0}
            className={styles.card}
          />
        ))}
        <ButtonLink href={bestsellers.cta.href} className={styles.allProducts}>
          {bestsellers.cta.label}
        </ButtonLink>
      </div>
    </section>
  );
}
