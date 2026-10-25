import Link from 'next/link';
import { brandHref } from '@/content/routes';
import type { Brand } from '@/lib/catalog';
import { cx } from '@/lib/cx';
import styles from './AisleNav.module.css';

type AisleNavProps = {
  previous: Brand;
  next: Brand;
};

/** Walk to the neighbouring aisles, like moving along the shop floor. */
export function AisleNav({ previous, next }: AisleNavProps) {
  return (
    <nav className={styles.nav} aria-label="Neighbouring aisles">
      <Link href={brandHref(previous.slug)} transitionTypes={['nav-back']} className={styles.link}>
        <span className={styles.direction}>← Previous aisle</span>
        <span className={styles.name}>{previous.name}</span>
      </Link>
      <Link
        href={brandHref(next.slug)}
        transitionTypes={['nav-forward']}
        className={cx(styles.link, styles.next)}
      >
        <span className={styles.direction}>Next aisle →</span>
        <span className={styles.name}>{next.name}</span>
      </Link>
    </nav>
  );
}
