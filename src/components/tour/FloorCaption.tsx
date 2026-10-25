import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowRightIcon } from '@/components/icons';
import { storeFloor } from '@/content/home';
import { brandHref } from '@/content/routes';
import type { Stop } from '@/lib/tour-plan';
import type { CabinetData } from './cabinet-types';
import styles from './FloorCaption.module.css';

type FloorCaptionProps = {
  stop: Stop;
  cabinets: readonly CabinetData[];
  visible: boolean;
  /** No walk (reduced motion, or no 3D): list every house to step into. */
  still?: boolean;
  onOpen: (slug: string) => void;
  /** Walk to a house's cabinet. */
  onJump?: (cabinet: number) => void;
};

/**
 * The floor's words, set like the welcome over the shopfront: the house in
 * large cream type at the foot of the screen, what's in its cabinet, and the
 * way in. Beside it, the run of houses, so you always know where you are.
 */
export function FloorCaption({
  stop,
  cabinets,
  visible,
  still,
  onOpen,
  onJump,
}: FloorCaptionProps) {
  const cabinet = stop.kind === 'cabinet' && !still ? cabinets[stop.cabinet] : undefined;
  const current = stop.kind === 'cabinet' ? stop.cabinet : -1;
  const focusable = visible ? undefined : -1;
  const { intro } = storeFloor;

  return (
    <div className={styles.caption} data-visible={visible} data-still={still || undefined}>
      <span className={styles.scrim} aria-hidden="true" />

      {/* Keyed per stop, so each house arrives fresh. */}
      <div key={cabinet ? cabinet.slug : 'intro'} className={styles.words} aria-live="polite">
        {cabinet ? (
          <>
            <p className={styles.eyebrow} style={{ '--i': 0 } as CSSProperties}>
              {storeFloor.cabinet(cabinet.number)}
              <span className={styles.dot} aria-hidden="true" />
              {storeFloor.fragrances(cabinet.bottles.length)}
              <span className={styles.dot} aria-hidden="true" />
              {storeFloor.from(cabinet.fromPrice)}
            </p>
            <h3 className={styles.title} data-long={cabinet.name.length > 12 || undefined}>
              <span className={styles.titleText}>{cabinet.name}</span>
            </h3>
            <p className={styles.text} style={{ '--i': 1 } as CSSProperties}>
              {cabinet.tagline}
            </p>
            <div className={styles.actions} style={{ '--i': 2 } as CSSProperties}>
              <button
                type="button"
                className={styles.primary}
                onClick={() => onOpen(cabinet.slug)}
                aria-label={storeFloor.stepInsideLabel(cabinet.name)}
                tabIndex={focusable}
              >
                {storeFloor.stepInside}
                <span className={styles.primaryIcon}>
                  <ArrowRightIcon />
                </span>
              </button>
              <Link
                href={brandHref(cabinet.slug)}
                transitionTypes={['walk-in']}
                className={styles.secondary}
                tabIndex={focusable}
              >
                {storeFloor.visitAisle(cabinet.name)}
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className={styles.eyebrow} style={{ '--i': 0 } as CSSProperties}>
              {intro.eyebrow}
            </p>
            <h3 className={styles.title}>
              <span className={styles.titleText}>{intro.title(cabinets.length)}</span>
            </h3>
            <p className={styles.text} style={{ '--i': 1 } as CSSProperties}>
              {still ? storeFloor.still : intro.text}
            </p>
            {!still && (
              <p className={styles.hint} style={{ '--i': 2 } as CSSProperties}>
                {storeFloor.scrollHint}
                <span className={styles.hintLine} aria-hidden="true" />
              </p>
            )}
          </>
        )}
      </div>

      <nav className={styles.index} aria-label={storeFloor.houses}>
        <ol>
          {cabinets.map((house, index) => (
            <li key={house.slug}>
              <button
                type="button"
                className={styles.house}
                data-active={index === current || undefined}
                aria-current={index === current ? 'true' : undefined}
                onClick={() => (still || !onJump ? onOpen(house.slug) : onJump(index))}
                tabIndex={focusable}
              >
                <span className={styles.houseNumber}>{String(house.number).padStart(2, '0')}</span>
                <span className={styles.houseName}>{house.name}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Phones: a slim run of the houses instead of the list. */}
      {!still && (
        <ol className={styles.progress} aria-hidden="true">
          {cabinets.map((house, index) => (
            <li key={house.slug} data-done={index <= current || undefined} />
          ))}
        </ol>
      )}
    </div>
  );
}
