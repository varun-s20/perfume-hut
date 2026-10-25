'use client';

import {
  cubicBezier,
  motion,
  type MotionStyle,
  type MotionValue,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { type CSSProperties, useMemo, useRef, useState } from 'react';
import { tour } from '@/content/home';
import { type Layout, planTour, stopAt, type TourPlan } from '@/lib/tour-plan';
import { useMediaQuery } from '@/lib/use-media-query';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import type { CabinetData } from './cabinet-types';
import { Entrance, type EntranceFrame, type EntranceMotion } from './Entrance';
import { StoreFloor } from './StoreFloor';
import styles from './StoreTour.module.css';

/** Strong ease-in-out for on-screen movement (matches `--ease-in-out`). */
const easeInOut = cubicBezier(0.77, 0, 0.175, 1);
/** Gathers pace as you step through the window. */
const easeIn = cubicBezier(0.55, 0, 0.9, 0.4);
const linear = (t: number) => t;

/** Past the last cabinet by this much (svh), the words step aside for the last look. */
const ENDING = 30;

/**
 * The virtual store: a pinned stage whose layers are driven by scroll. Times
 * below are scroll positions in svh from the top of the tour.
 *
 *     0–100   the arch on the gallery wall opens onto the shopfront;
 *             the framed photographs slide away
 *   100–162   "Welcome to Perfume Hut", over the facade
 *   158–209   you walk through the window: the facade rushes past, and the
 *             glare off the glass covers the step from outside to in
 *   186–196   the store floor comes up behind the glare
 *   222–      the lights come up; scrolling walks you round the floor,
 *             case by case (the walk comes from lib/tour-plan.ts)
 *
 * The entrance animates only transform, opacity and the arch's clip; the
 * floor is WebGL and follows the scroll itself (StoreFloor).
 */
export function StoreTour({
  frames,
  cabinets,
}: {
  frames: readonly EntranceFrame[];
  cabinets: readonly CabinetData[];
}) {
  const trackRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const layout: Layout = useMediaQuery('(width < 960px)') ? 'narrow' : 'wide';
  const plan = useMemo(() => planTour(cabinets.length, layout), [cabinets.length, layout]);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  // A light spring gives the entrance weight without lagging behind the scroll.
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 36, mass: 0.4 });

  const [arrived, setArrived] = useState(false);
  const [ended, setEnded] = useState(false);
  const [stop, setStop] = useState({ index: 0, moving: false });
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const position = value * plan.length;
    setArrived(position >= plan.arrival);
    setEnded(position > plan.stops.at(-1)!.at + ENDING);
    const next = stopAt(plan, position);
    setStop((current) =>
      current.index === next.index && current.moving === next.moving ? current : next,
    );
  });

  // The houses' list walks you to a cabinet: scroll to where the walk reaches it.
  const jumpTo = (cabinet: number) => {
    const track = trackRef.current;
    const target = plan.stops.find((s) => s.kind === 'cabinet' && s.cabinet === cabinet);
    if (!track || !target) return;
    const svh = track.offsetHeight / (plan.length + 100);
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + target.at * svh, behavior: 'smooth' });
  };

  const motionStyles = useEntranceMotion(progress, plan);
  const trackStyle = { '--tour-length': plan.length } as CSSProperties;

  return (
    <section
      ref={trackRef}
      className={styles.track}
      style={trackStyle}
      data-reduced={reduced || undefined}
      // While the stage fills the screen, the phone header steps out of the way.
      data-immersive={reduced ? undefined : true}
      aria-label="Virtual tour of the Perfume Hut store"
    >
      {/* Where "Skip the walk-in" lands: just inside, at the first look down the floor. */}
      <span
        id="aisles"
        className={styles.anchor}
        style={{ '--at': plan.stops[0]!.at } as CSSProperties}
      />
      <span id="tour-end" className={styles.end} />

      {/* Without motion the doorway simply stands at the top. */}
      {reduced && (
        <div className={styles.entranceStill}>
          <Entrance frames={frames} />
        </div>
      )}

      <div className={styles.stage}>
        {!reduced && <Entrance frames={frames} motionStyles={motionStyles.entrance} />}

        <motion.div
          className={styles.welcomeScrim}
          style={reduced ? undefined : motionStyles.welcomeScrim}
          aria-hidden="true"
        />
        <motion.p
          className={styles.welcome}
          style={reduced ? undefined : motionStyles.welcome}
          aria-hidden="true"
        >
          <span>{tour.welcome[0]}</span>
          <span className={styles.welcomeName}>{tour.welcome[1]}</span>
        </motion.p>

        <StoreFloor
          cabinets={cabinets}
          plan={plan}
          layout={layout}
          progress={scrollYProgress}
          revealStyle={motionStyles.reveal}
          stop={stop}
          arrived={arrived}
          ended={ended}
          still={reduced}
          onJump={jumpTo}
        />

        {/* The glare off the window as you step through it. */}
        {!reduced && (
          <motion.div className={styles.glare} style={motionStyles.glare} aria-hidden="true" />
        )}
      </div>
    </section>
  );
}

function useEntranceMotion(progress: MotionValue<number>, plan: TourPlan) {
  // Keyframes are written in svh of scroll; progress runs 0–1 over the tour.
  const f = (positions: number[]) => positions.map((position) => position / plan.length);

  // The doorway: its clip opens (0 → 1) onto the whole shopfront.
  const open = useTransform(progress, f([14, 101]), [0, 1], { ease: easeInOut });
  // The camera drifts towards the window, then walks through it.
  const sceneScale = useTransform(progress, f([14, 101, 158, 209]), [1, 1.05, 1.16, 2.8], {
    ease: [easeInOut, linear, easeIn],
  });
  const portalOpacity = useTransform(progress, f([192, 198]), [1, 0]);
  // Light off the glass swells as you reach it, then clears onto the store.
  const glareOpacity = useTransform(progress, f([168, 186, 196, 216]), [0, 0.94, 0.94, 0]);
  // The wall is covered by the shopfront by now; dropping it lets what's behind show.
  const wallOpacity = useTransform(progress, f([97, 101]), [1, 0]);

  // You walk past the photographs: they slide off the wall rather than fade.
  const galleryX = useTransform(progress, f([7, 86]), [0, -44], { ease: easeInOut });
  const galleryOpacity = useTransform(progress, f([58, 86]), [1, 0]);
  const casingOpacity = useTransform(progress, f([11, 36]), [1, 0]);
  const cueOpacity = useTransform(progress, f([0, 14]), [1, 0]);

  const welcomeOpacity = useTransform(progress, f([101, 119, 144, 162]), [0, 1, 1, 0]);
  const welcomeRise = useTransform(progress, f([101, 122]), [2.4, 0]);

  // The floor comes up through the window you walked through.
  const revealOpacity = useTransform(progress, f(plan.reveal), [0, 1]);

  // Full transform strings keep the work on the compositor.
  const scene = useMotionTemplate`scale(${sceneScale})`;
  const gallery = useMotionTemplate`translateX(${galleryX}cqw)`;
  const welcome = useMotionTemplate`translateY(${welcomeRise}rem)`;

  const entrance: EntranceMotion = {
    // Motion drives CSS variables at runtime; its style type just doesn't list them.
    portal: { '--open': open, opacity: portalOpacity } as MotionStyle,
    scene: { transform: scene },
    wall: { opacity: wallOpacity },
    gallery: { transform: gallery, opacity: galleryOpacity },
    casing: { opacity: casingOpacity },
    cue: { opacity: cueOpacity },
  };

  return {
    entrance,
    welcome: { transform: welcome, opacity: welcomeOpacity } as MotionStyle,
    welcomeScrim: { opacity: welcomeOpacity } as MotionStyle,
    reveal: { opacity: revealOpacity } as MotionStyle,
    glare: { opacity: glareOpacity } as MotionStyle,
  };
}
