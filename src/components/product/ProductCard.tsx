import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition } from 'react';
import { productHref } from '@/content/routes';
import { getBrandName, getStartingPrice, type Product } from '@/lib/catalog';
import { cx } from '@/lib/cx';
import { formatMoney } from '@/lib/money';
import styles from './ProductCard.module.css';
import { QuickAdd } from './QuickAdd';

type ProductCardProps = {
  product: Product;
  /** Responsive `sizes` for the image; defaults to a four-up grid. */
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  sizes = '(max-width: 959px) calc(50vw - 22px), min(21.5vw, 310px)',
  priority = false,
  className,
}: ProductCardProps) {
  const brandName = getBrandName(product.brandSlug);
  const hasRange = product.sizes.length > 1;

  return (
    <article className={cx(styles.card, className)}>
      <div className={styles.media}>
        <Link
          href={productHref(product.slug)}
          transitionTypes={['nav-forward']}
          className={styles.imageLink}
          tabIndex={-1}
          aria-hidden="true"
        >
          {/* Same name on the product page: the photo morphs into the hero. */}
          <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
            <Image
              src={product.image}
              alt=""
              sizes={sizes}
              placeholder="blur"
              loading={priority ? 'eager' : 'lazy'}
              className={styles.image}
              style={{ objectPosition: product.imagePosition }}
            />
          </ViewTransition>
        </Link>
        {product.bestseller && <span className={styles.badge}>Bestseller</span>}
        <QuickAdd
          slug={product.slug}
          ml={product.sizes[0].ml}
          label={`Add ${brandName} ${product.name}, ${product.sizes[0].ml} ml, to bag`}
        />
      </div>

      <div className={styles.info}>
        <p className={styles.brand}>{brandName}</p>
        <h3 className={styles.name}>
          <Link
            href={productHref(product.slug)}
            transitionTypes={['nav-forward']}
            className={styles.nameLink}
          >
            {product.name}
          </Link>
        </h3>
        <p className={styles.meta}>
          <span>{product.concentration}</span>
          <span className={styles.price}>
            {hasRange && <span className={styles.from}>from </span>}
            {formatMoney(getStartingPrice(product))}
          </span>
        </p>
      </div>
    </article>
  );
}
