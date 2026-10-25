import { ViewTransition } from 'react';
import type { Product } from '@/lib/catalog';
import { cx } from '@/lib/cx';
import { ProductCard } from './ProductCard';
import styles from './ProductGrid.module.css';

type ProductGridProps = {
  products: readonly Product[];
  /** Number of leading cards whose images load eagerly (above the fold). */
  eagerCount?: number;
  columns?: 3 | 4;
};

/**
 * Each card keeps its identity across filter changes (`key`), so filtering
 * animates cards in, out and into their new places. Page navigations leave the
 * grid alone and let the product image morph instead.
 */
export function ProductGrid({ products, eagerCount = 0, columns = 4 }: ProductGridProps) {
  return (
    <div className={cx(styles.grid, columns === 3 && styles.three)}>
      {products.map((product, index) => (
        <ViewTransition
          key={product.slug}
          default="none"
          enter={{ filter: 'fade-in', default: 'none' }}
          exit={{ filter: 'fade-out', default: 'none' }}
          update={{ filter: 'auto', default: 'none' }}
        >
          <ProductCard
            product={product}
            priority={index < eagerCount}
            sizes={
              columns === 3
                ? '(max-width: 959px) calc(50vw - 22px), min(29vw, 420px)'
                : '(max-width: 959px) calc(50vw - 22px), min(21.5vw, 310px)'
            }
          />
        </ViewTransition>
      ))}
    </div>
  );
}
