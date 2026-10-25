'use client';

import { type CSSProperties, useEffect, useId, useState } from 'react';
import { buttonClassName, ButtonIcon } from '@/components/ui/ButtonLink';
import { bagDrawer, dispatchCart } from '@/lib/cart-store';
import type { ProductSize } from '@/lib/catalog-types';
import { formatMoney } from '@/lib/money';
import styles from './ProductPurchase.module.css';

type ProductPurchaseProps = {
  slug: string;
  sizes: readonly ProductSize[];
  inStock: boolean;
};

const ADDED_FEEDBACK_MS = 1600;

export function ProductPurchase({ slug, sizes, inStock }: ProductPurchaseProps) {
  const [selectedMl, setSelectedMl] = useState(sizes[0]?.ml);
  const [added, setAdded] = useState(false);
  const groupName = useId();

  const selectedIndex = Math.max(
    0,
    sizes.findIndex((size) => size.ml === selectedMl),
  );
  const selected = sizes[selectedIndex];

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [added]);

  if (!selected) return null;

  const addToBag = () => {
    dispatchCart({ type: 'add', slug, ml: selected.ml });
    setAdded(true);
    bagDrawer.open();
  };

  return (
    <div className={styles.purchase}>
      <fieldset className={styles.sizes}>
        <legend className={styles.legend}>Size</legend>
        <div
          className={styles.segments}
          style={{ '--count': sizes.length, '--index': selectedIndex } as CSSProperties}
        >
          {/* One indicator that glides between options (an interruptible CSS transition). */}
          <span className={styles.indicator} aria-hidden="true" />
          {sizes.map((size) => (
            <label key={size.ml} className={styles.segment}>
              <input
                type="radio"
                name={groupName}
                value={size.ml}
                checked={size.ml === selected.ml}
                onChange={() => setSelectedMl(size.ml)}
                className={styles.radio}
              />
              <span>{size.ml} ml</span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className={styles.price} aria-live="polite">
        {formatMoney(selected.price)}
      </p>

      <button
        type="button"
        className={buttonClassName({ size: 'large', block: true })}
        onClick={addToBag}
        disabled={!inStock}
      >
        <span className={styles.label} data-added={added}>
          <span className={styles.labelIdle}>{inStock ? 'Add to bag' : 'Sold out'}</span>
          <span className={styles.labelAdded} aria-hidden={!added}>
            Added to bag
          </span>
        </span>
        <ButtonIcon />
      </button>
    </div>
  );
}
