import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { storeFloor } from '@/content/home';
import { brandHref } from '@/content/routes';
import { cx } from '@/lib/cx';
import type { Stop } from '@/lib/tour-plan';
import type { CabinetData } from './cabinet-types';
import styles from './Placard.module.css';

type PlacardProps = {
  stop: Stop;
  cabinets: readonly CabinetData[];
  /** Walking between stops: the placard steps out of the way. */
  moving: boolean;
  visible: boolean;
  onOpen: (slug: string) => void;
};

/**
 * The floor's signage: a brass-edged placard beside each cabinet with the
 * house, its line and the way in. It takes the side of the screen the plan
 * gives the guide, so the cabinet always has the other half to itself.
 */
export function Placard({ stop, cabinets, moving, visible, onOpen }: PlacardProps) {
  const cabinet = stop.kind === 'cabinet' ? cabinets[stop.cabinet] : undefined;
  const favourite = cabinet?.bottles.find((bottle) => bottle.bestseller) ?? cabinet?.bottles[0];
  const show = visible && !moving;
  const copy = stop.kind === 'outro' ? storeFloor.outro : storeFloor.intro;

  return (
    <aside
      className={cx(styles.placard, stop.side === 'right' && styles.right)}
      data-visible={show}
      aria-live="polite"
    >
      {/* Keyed per stop, so each one arrives fresh. */}
      <div key={stop.kind === 'cabinet' ? stop.cabinet : stop.kind} className={styles.card}>
        {cabinet ? (
          <>
            <p className={styles.eyebrow}>
              No. {String(cabinet.number).padStart(2, '0')} ·{' '}
              {storeFloor.fragrances(cabinet.bottles.length)}
            </p>
            <h3 className={styles.title}>{cabinet.name}</h3>
            <p className={styles.text}>{cabinet.tagline}</p>
            <dl className={styles.facts}>
              {favourite && (
                <div>
                  <dt>{storeFloor.favourite}</dt>
                  <dd>{favourite.name}</dd>
                </div>
              )}
              <div>
                <dt>Prices</dt>
                <dd>{storeFloor.from(cabinet.fromPrice)}</dd>
              </div>
            </dl>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primary}
                onClick={() => onOpen(cabinet.slug)}
                tabIndex={show ? undefined : -1}
              >
                {storeFloor.stepInside(cabinet.name)}
                <ArrowRightIcon className={styles.arrow} />
              </button>
              <Link
                href={brandHref(cabinet.slug)}
                transitionTypes={['walk-in']}
                className={styles.secondary}
                tabIndex={show ? undefined : -1}
              >
                {storeFloor.visitAisle(cabinet.name)}
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h3 className={styles.title}>
              {copy.title[0]}
              <br />
              {copy.title[1]}
            </h3>
            <p className={styles.text}>{copy.text}</p>
            <div className={styles.actions}>
              {stop.kind === 'intro' ? (
                <span className={styles.hint}>
                  {storeFloor.scrollHint}
                  <span className={styles.hintLine} aria-hidden="true" />
                </span>
              ) : (
                <Link
                  href={storeFloor.browseAll.href}
                  className={styles.primary}
                  tabIndex={show ? undefined : -1}
                >
                  {storeFloor.browseAll.label}
                  <ArrowRightIcon className={styles.arrow} />
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
