'use client';

import { bagDrawer, dispatchCart } from '@/lib/cart-store';
import styles from './QuickAdd.module.css';

type QuickAddProps = {
  slug: string;
  ml: number;
  label: string;
};

/** Adds the smallest size straight from a product card, then shows the bag. */
export function QuickAdd({ slug, ml, label }: QuickAddProps) {
  return (
    <button
      type="button"
      className={styles.button}
      aria-label={label}
      onClick={() => {
        dispatchCart({ type: 'add', slug, ml });
        bagDrawer.open();
      }}
    >
      <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        <path d="M6 1v10M1 6h10" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </button>
  );
}
