'use client';

import { BagLines } from '@/components/cart/BagLines';
import { BagSummary } from '@/components/cart/BagSummary';
import { useBag } from '@/components/cart/use-bag';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { routes } from '@/content/routes';
import styles from './page.module.css';

export function BagView() {
  const { lines, subtotal } = useBag();

  if (lines.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Your bag is empty — the aisles are waiting.</p>
        <ButtonLink href={routes.shop}>Browse all fragrances</ButtonLink>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <section aria-label="Items in your bag">
        <BagLines lines={lines} size="roomy" />
      </section>
      <aside className={styles.summary} aria-label="Order summary">
        <BagSummary subtotal={subtotal} />
      </aside>
    </div>
  );
}
