'use client';

import { type CSSProperties, type ReactNode, useState } from 'react';
import { productPage } from '@/content/product';
import type { BottleSpec } from '@/data/bottles';
import { BottleViewer } from './BottleViewer';
import styles from './ProductMedia.module.css';

type View = 'photo' | 'model';

type ProductMediaProps = {
  /** The photograph (server-rendered, so it can morph in from the card you tapped). */
  photo: ReactNode;
  spec: BottleSpec;
  name: string;
  badge?: string;
};

/**
 * The product's picture: its photograph, or the bottle itself in 3D. The 3D
 * view loads the first time you ask for it and stays ready after that.
 */
export function ProductMedia({ photo, spec, name, badge }: ProductMediaProps) {
  const [view, setView] = useState<View>('photo');
  const [seen, setSeen] = useState(false);
  const views: View[] = ['photo', 'model'];

  const choose = (next: View) => {
    setView(next);
    if (next === 'model') setSeen(true);
  };

  return (
    <div className={styles.media} data-view={view}>
      <div className={styles.photo} aria-hidden={view !== 'photo'}>
        {photo}
      </div>
      {seen && (
        <div className={styles.model} aria-hidden={view !== 'model'} inert={view !== 'model'}>
          <BottleViewer spec={spec} label={`${name}, in 3D`} />
          <p className={styles.hint}>{productPage.turnHint}</p>
        </div>
      )}

      {badge && <span className={styles.badge}>{badge}</span>}

      <div
        className={styles.switch}
        role="group"
        aria-label="View"
        style={{ '--index': views.indexOf(view) } as CSSProperties}
      >
        <span className={styles.indicator} aria-hidden="true" />
        {views.map((option) => (
          <button
            key={option}
            type="button"
            className={styles.option}
            aria-pressed={view === option}
            onClick={() => choose(option)}
          >
            {productPage.views[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
