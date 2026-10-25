'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CloseIcon } from '@/components/icons';
import { productHref } from '@/content/routes';
import { type ResolvedLine } from '@/lib/cart';
import { dispatchCart } from '@/lib/cart-store';
import { getBrandName } from '@/lib/catalog';
import { cx } from '@/lib/cx';
import { formatMoney } from '@/lib/money';
import styles from './BagLines.module.css';

type BagLinesProps = {
  lines: readonly ResolvedLine[];
  /** Called when a product link is followed, e.g. to close the drawer. */
  onNavigate?: () => void;
  size?: 'compact' | 'roomy';
};

export function BagLines({ lines, onNavigate, size = 'compact' }: BagLinesProps) {
  return (
    <ul className={cx(styles.lines, size === 'roomy' && styles.roomy)}>
      {lines.map((line) => {
        const { product } = line;
        const title = `${getBrandName(product.brandSlug)} ${product.name}`;
        return (
          <li key={`${line.slug}-${line.ml}`} className={styles.line}>
            <Link
              href={productHref(product.slug)}
              className={styles.thumb}
              onClick={onNavigate}
              tabIndex={-1}
              aria-hidden="true"
            >
              <Image
                src={product.image}
                alt=""
                sizes="96px"
                className={styles.image}
                style={{ objectPosition: product.imagePosition }}
              />
            </Link>
            <div className={styles.body}>
              <p className={styles.brand}>{getBrandName(product.brandSlug)}</p>
              <Link href={productHref(product.slug)} className={styles.name} onClick={onNavigate}>
                {product.name}
              </Link>
              <p className={styles.meta}>
                {product.concentration} · {line.ml} ml
              </p>
              <div className={styles.controls}>
                <div className={styles.stepper} role="group" aria-label={`Quantity of ${title}`}>
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() =>
                      dispatchCart({
                        type: 'setQuantity',
                        slug: line.slug,
                        ml: line.ml,
                        quantity: line.quantity - 1,
                      })
                    }
                  >
                    −
                  </button>
                  <output aria-live="polite">{line.quantity}</output>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => dispatchCart({ type: 'add', slug: line.slug, ml: line.ml })}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => dispatchCart({ type: 'remove', slug: line.slug, ml: line.ml })}
                >
                  <CloseIcon className={styles.removeIcon} />
                  <span>Remove</span>
                  <span className="visually-hidden"> {title}</span>
                </button>
              </div>
            </div>
            <p className={styles.total}>{formatMoney(line.lineTotal)}</p>
          </li>
        );
      })}
    </ul>
  );
}
