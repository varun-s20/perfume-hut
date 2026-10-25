import { eyebrowLabel } from '@/content/home';
import { cx } from '@/lib/cx';
import styles from './EyebrowPill.module.css';

type EyebrowPillProps = {
  label?: string;
  className?: string;
};

export function EyebrowPill({ label = eyebrowLabel, className }: EyebrowPillProps) {
  return (
    <p className={cx(styles.pill, className)}>
      {label}
      <svg className={styles.bottle} viewBox="0 0 10 19" aria-hidden="true" focusable="false">
        <rect x="3.4" y="0.6" width="3.2" height="2.6" rx="0.5" fill="#c9a86a" />
        <rect x="4.2" y="3.2" width="1.6" height="1.6" fill="#a8864d" />
        <rect x="0.8" y="4.8" width="8.4" height="13.6" rx="1.4" fill="#d6474b" />
        <rect x="0.8" y="4.8" width="8.4" height="5" rx="1.4" fill="#ee8682" />
        <rect x="2.4" y="8.4" width="5.2" height="4.4" rx="0.3" fill="#fff" opacity="0.85" />
      </svg>
    </p>
  );
}
