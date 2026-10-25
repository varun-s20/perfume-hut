'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { ArrowRightIcon, CloseIcon } from '@/components/icons';
import { storeFloor } from '@/content/home';
import { brandHref } from '@/content/routes';
import { flags } from '@/lib/flags';
import { AvaConversation } from './AvaConversation';
import type { CabinetData, ShelfBottle } from './cabinet-types';
import styles from './CabinetRoom.module.css';
import type { Hit } from './store3d/StoreScene';

type CabinetRoomProps = {
  cabinet: CabinetData;
  /** What's on the store's canvas under a point on screen. */
  pick: (clientX: number, clientY: number) => Hit | null;
  onHover: (hit: Hit | null) => void;
  /** A bottle to turn to you on the shelves (a list hover, or Ava's pick). */
  onHighlight: (slug: string | null) => void;
  onClose: () => void;
};

/** How long the panel takes to leave before the doors close behind it. */
const LEAVE_MS = 220;

/**
 * Inside a house's cabinet: the camera has walked up to the case and its
 * doors stand open (the store draws that); this is everything over it. The
 * house's panel beside the case, a name tag on the bottle you point at, and
 * the way back to the floor. The page behind goes inert; Esc closes.
 */
export function CabinetRoom({ cabinet, pick, onHover, onHighlight, onClose }: CabinetRoomProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [tag, setTag] = useState<{ bottle: ShelfBottle; x: number; y: number } | null>(null);
  const bottles = new Map(cabinet.bottles.map((bottle) => [bottle.slug, bottle]));

  const leave = () => {
    if (leaving) return;
    setLeaving(true);
    onHover(null);
    onHighlight(null);
    window.setTimeout(onClose, LEAVE_MS);
  };
  const leaveOnEscape = useEffectEvent(leave);

  // Modal behaviour: the page behind goes inert and still, Esc closes, and
  // focus returns to whatever opened the cabinet.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const page = document.querySelector('.page');
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;

    page?.setAttribute('inert', '');
    html.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') leaveOnEscape();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      page?.removeAttribute('inert');
      html.style.overflow = previousOverflow;
      opener?.focus({ preventScroll: true });
    };
  }, []);

  const bottleAt = (point: { clientX: number; clientY: number }) => {
    const hit = pick(point.clientX, point.clientY);
    return hit?.kind === 'bottle' ? bottles.get(hit.slug) : undefined;
  };

  // Pointing at the shelves: the bottle turns to you and its name follows the pointer.
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const bottle = bottleAt(event);
    onHover(bottle ? { kind: 'bottle', slug: bottle.slug } : null);
    setTag(bottle ? { bottle, x: event.clientX, y: event.clientY } : null);
  };

  const onClick = (event: MouseEvent) => {
    const bottle = bottleAt(event);
    if (bottle) router.push(bottle.href);
    else leave();
  };

  return createPortal(
    <div
      className={styles.room}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-ava={flags.ava || undefined}
      data-leaving={leaving || undefined}
    >
      <div
        className={styles.shelves}
        data-pointing={Boolean(tag) || undefined}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          onHover(null);
          setTag(null);
        }}
        onClick={onClick}
        aria-hidden="true"
      />

      {tag && (
        <span
          className={styles.tag}
          style={{ translate: `${tag.x}px ${tag.y}px` }}
          aria-hidden="true"
        >
          <span className={styles.tagName}>{tag.bottle.name}</span>
          <span className={styles.tagMeta}>
            {tag.bottle.concentration} · {tag.bottle.price}
          </span>
        </span>
      )}

      <button ref={closeRef} type="button" className={styles.close} onClick={leave}>
        <CloseIcon className={styles.closeIcon} />
        {storeFloor.room.close}
      </button>

      {flags.ava ? (
        <>
          <h2 id={titleId} className="visually-hidden">
            The {cabinet.name} cabinet
          </h2>
          <AvaConversation cabinet={cabinet} onPick={(slug) => onHighlight(slug ?? null)} />
        </>
      ) : (
        <HousePanel cabinet={cabinet} titleId={titleId} onHighlight={onHighlight} />
      )}
    </div>,
    document.body,
  );
}

/** The house's panel beside its open case: who they are, what's on the shelves, where next. */
function HousePanel({
  cabinet,
  titleId,
  onHighlight,
}: {
  cabinet: CabinetData;
  titleId: string;
  onHighlight: (slug: string | null) => void;
}) {
  const { room, browseAll } = storeFloor;
  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <p className={styles.eyebrow}>{room.eyebrow(String(cabinet.number).padStart(2, '0'))}</p>
      <h2 id={titleId} className={styles.title}>
        {cabinet.name}
      </h2>
      <p className={styles.tagline}>{cabinet.tagline}</p>
      <p className={styles.story}>{cabinet.story}</p>

      <div className={styles.shelf}>
        <p className={styles.shelfHeading}>
          {room.shelves}
          <span>{room.fragrances(cabinet.bottles.length)}</span>
        </p>
        <ul className={styles.bottles}>
          {cabinet.bottles.map((bottle) => (
            <li key={bottle.slug}>
              <Link
                href={bottle.href}
                transitionTypes={['nav-forward']}
                className={styles.bottle}
                onPointerEnter={() => onHighlight(bottle.slug)}
                onPointerLeave={() => onHighlight(null)}
                onFocus={() => onHighlight(bottle.slug)}
                onBlur={() => onHighlight(null)}
              >
                <span className={styles.bottleName}>
                  {bottle.name}
                  <span className={styles.bottleMeta}>{bottle.concentration}</span>
                </span>
                <span className={styles.bottlePrice}>{bottle.price}</span>
                <ArrowRightIcon className={styles.bottleArrow} />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.hint}>{room.hint}</p>
      <div className={styles.actions}>
        <Link
          href={brandHref(cabinet.slug)}
          transitionTypes={['walk-in']}
          className={styles.primary}
        >
          {storeFloor.visitAisle(cabinet.name)}
          <ArrowRightIcon className={styles.arrow} />
        </Link>
        <Link href={browseAll.href} className={styles.secondary}>
          {browseAll.label}
        </Link>
      </div>
    </section>
  );
}
