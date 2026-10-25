import type { CSSProperties } from 'react';
import { CheckIcon } from '@/components/icons';
import { familySwatches } from '@/content/shop';
import type { Family } from '@/lib/catalog-types';
import { cx } from '@/lib/cx';
import styles from './Swatch.module.css';

/** A scent family as colour, in an arched doorway like the aisles; ticked when chosen. */
export function Swatch({
  family,
  active,
  className,
}: {
  family: Family;
  active: boolean;
  className?: string;
}) {
  const [from, to] = familySwatches[family].colours;
  return (
    <span
      className={cx(styles.arch, className)}
      data-active={active || undefined}
      style={{ '--from': from, '--to': to } as CSSProperties}
      aria-hidden="true"
    >
      <span className={styles.fill} />
      <span className={styles.tick}>
        <CheckIcon />
      </span>
    </span>
  );
}
