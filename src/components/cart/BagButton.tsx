'use client';

import { BagIcon } from '@/components/icons';
import { countItems } from '@/lib/cart';
import { bagDrawer, useCartLines } from '@/lib/cart-store';
import { cx } from '@/lib/cx';
import styles from './BagButton.module.css';

export function BagButton({ className }: { className?: string }) {
  const count = countItems(useCartLines());

  return (
    <button
      type="button"
      className={cx(styles.button, className)}
      onClick={bagDrawer.open}
      aria-haspopup="dialog"
      aria-label={count > 0 ? `Bag, ${count} ${count === 1 ? 'item' : 'items'}` : 'Bag, empty'}
    >
      Bag
      <span className={styles.iconWrap}>
        <BagIcon className={styles.icon} />
        {count > 0 && (
          // Re-keyed so the badge bumps whenever the count changes.
          <span key={count} className={styles.badge} aria-hidden="true">
            {count}
          </span>
        )}
      </span>
    </button>
  );
}
