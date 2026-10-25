import type { ReactNode } from 'react';
import { EyebrowPill } from './EyebrowPill';
import { Lines } from './Lines';
import styles from './PageHeader.module.css';

type PageHeaderProps = {
  eyebrow: string;
  title: readonly string[];
  intro?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({ eyebrow, title, intro, children }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <EyebrowPill label={eyebrow} />
      <h1 className={styles.title}>
        <Lines lines={title} />
      </h1>
      {intro && <p className={styles.intro}>{intro}</p>}
      {children}
    </header>
  );
}
