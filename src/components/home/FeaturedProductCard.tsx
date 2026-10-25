import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition } from 'react';
import { ArrowRightIcon } from '@/components/icons';
import { productHref } from '@/content/routes';
import { getBrandName, getStartingPrice, type Product } from '@/lib/catalog';
import { cx } from '@/lib/cx';
import { formatMoney } from '@/lib/money';
import styles from './FeaturedProductCard.module.css';

type FeaturedProductCardProps = {
  product: Product;
  position: number;
  featured?: boolean;
  className?: string;
};

/** Editorial product card used on the store floor (one large, two small). */
export function FeaturedProductCard({
  product,
  position,
  featured = false,
  className,
}: FeaturedProductCardProps) {
  const href = productHref(product.slug);

  return (
    <article className={cx(styles.card, featured && styles.featured, className)}>
      <div className={styles.head} aria-hidden="true">
        <span className={styles.position}>{String(position).padStart(2, '0')}</span>
        <ArrowRightIcon className={styles.arrow} />
      </div>

      <Link
        href={href}
        transitionTypes={['nav-forward']}
        className={cx(styles.media, 'reveal-clip')}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
          <Image
            src={product.image}
            alt=""
            sizes={
              featured
                ? '(max-width: 959px) calc(100vw - 32px), min(43.3vw, 624px)'
                : '(max-width: 959px) calc(50vw - 22px), min(20.5vw, 296px)'
            }
            placeholder="blur"
            className={styles.image}
            style={{ objectPosition: product.imagePosition }}
          />
        </ViewTransition>
      </Link>

      <div className={styles.info}>
        <h3 className={styles.name}>
          <Link href={href} transitionTypes={['nav-forward']} className={styles.nameLink}>
            {getBrandName(product.brandSlug)} - {product.name}
          </Link>
          <span className={styles.concentration}>{product.concentration}</span>
        </h3>
        <p className={styles.price}>{formatMoney(getStartingPrice(product))}</p>
      </div>
    </article>
  );
}
