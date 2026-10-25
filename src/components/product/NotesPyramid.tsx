import type { CSSProperties } from 'react';
import type { Product } from '@/lib/catalog';
import { cx } from '@/lib/cx';
import styles from './NotesPyramid.module.css';

const tiers = [
  { key: 'top', label: 'Top notes', timing: 'The first 15 minutes' },
  { key: 'heart', label: 'Heart notes', timing: 'The first few hours' },
  { key: 'base', label: 'Base notes', timing: 'Into the dry-down' },
] as const;

/** Top, heart and base notes, revealed tier by tier as they scroll in. */
export function NotesPyramid({ notes }: { notes: Product['notes'] }) {
  return (
    <section className={styles.pyramid} aria-labelledby="notes-heading">
      <h2 id="notes-heading" className={styles.heading}>
        How it unfolds
      </h2>
      <ol className={styles.tiers}>
        {tiers.map((tier, index) => (
          <li
            key={tier.key}
            className={cx(styles.tier, 'reveal')}
            style={{ '--reveal-delay': `${index * 8}%` } as CSSProperties}
          >
            <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h3 className={styles.label}>{tier.label}</h3>
              <p className={styles.timing}>{tier.timing}</p>
            </div>
            <p className={styles.notes}>{notes[tier.key].join(' · ')}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
