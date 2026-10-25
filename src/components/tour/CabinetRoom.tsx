'use client';

import { motion, useMotionTemplate, useSpring } from 'motion/react';
import Link from 'next/link';
import {
  type PointerEvent,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  ViewTransition,
} from 'react';
import { createPortal } from 'react-dom';
import { ArrowRightIcon, CloseIcon } from '@/components/icons';
import { ava, storeFloor } from '@/content/home';
import { brandHref } from '@/content/routes';
import { flags } from '@/lib/flags';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import { AvaConversation } from './AvaConversation';
import { CabinetBox } from './CabinetBox';
import type { CabinetData } from './cabinet-types';
import styles from './CabinetRoom.module.css';

type CabinetRoomProps = {
  cabinet: CabinetData;
  onClose: () => void;
};

/** How far the case turns to follow the pointer (degrees). */
const TILT = { x: 5, y: 9 };
/** A little weight, and a quick settle. */
const TILT_SPRING = { stiffness: 140, damping: 22, mass: 0.6 };

/**
 * Inside a house's section: the case from the floor grows to fill the room,
 * its glass doors swing open onto the bottles, and it turns gently with the
 * pointer so you can see into it. Beside it, the house's panel (or Ava, when
 * she's switched on).
 */
export function CabinetRoom({ cabinet, onClose }: CabinetRoomProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [pickSlug, setPickSlug] = useState<string>();
  const reduced = usePrefersReducedMotion();

  const close = useEffectEvent(onClose);

  // Modal behaviour: the page behind goes inert and still, Esc closes, and
  // focus returns to the cabinet that opened the room.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const page = document.querySelector('.page');
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;

    page?.setAttribute('inert', '');
    html.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      page?.removeAttribute('inert');
      html.style.overflow = previousOverflow;
      opener?.focus({ preventScroll: true });
    };
  }, []);

  // The case follows a mouse, on a spring; touch and reduced motion leave it be.
  const tiltX = useSpring(0, TILT_SPRING);
  const tiltY = useSpring(0, TILT_SPRING);
  const tilt = useMotionTemplate`rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  const follow = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || reduced) return;
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    tiltY.set(x * 2 * TILT.y);
    tiltX.set(-y * 2 * TILT.x);
  };
  const settle = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return createPortal(
    <ViewTransition enter="room-in" exit="room-out" default="none">
      <div
        className={styles.room}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-ava={flags.ava || undefined}
        onPointerMove={follow}
        onPointerLeave={settle}
      >
        <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

        <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
          <CloseIcon className={styles.closeIcon} />
          {storeFloor.room.close}
        </button>

        <div className={styles.stage}>
          <span className={styles.shadow} aria-hidden="true" />
          <motion.div className={styles.tilt} style={{ transform: tilt }}>
            <CabinetBox
              cabinet={cabinet}
              variant="room"
              pickSlug={pickSlug}
              pickLabel={ava.room.pickLabel}
            />
          </motion.div>
        </div>

        {flags.ava ? (
          <>
            <h2 id={titleId} className="visually-hidden">
              The {cabinet.name} cabinet
            </h2>
            <AvaConversation cabinet={cabinet} onPick={setPickSlug} />
          </>
        ) : (
          <HousePanel cabinet={cabinet} titleId={titleId} />
        )}
      </div>
    </ViewTransition>,
    document.body,
  );
}

/** The house's card beside its open case: who they are, and where to go next. */
function HousePanel({ cabinet, titleId }: { cabinet: CabinetData; titleId: string }) {
  const { room, browseAll } = storeFloor;
  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <p className={styles.eyebrow}>{room.eyebrow(String(cabinet.number).padStart(2, '0'))}</p>
      <h2 id={titleId} className={styles.title}>
        {cabinet.name}
      </h2>
      <p className={styles.tagline}>{cabinet.tagline}</p>
      <p className={styles.story}>{cabinet.story}</p>
      <dl className={styles.facts}>
        <div>
          <dt>On the shelves</dt>
          <dd>{room.fragrances(cabinet.bottles.length)}</dd>
        </div>
        <div>
          <dt>Prices</dt>
          <dd>{room.from(cabinet.fromPrice)}</dd>
        </div>
      </dl>
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
