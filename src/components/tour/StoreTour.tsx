'use client';

import {
  cubicBezier,
  type EasingFunction,
  motion,
  type MotionStyle,
  type MotionValue,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { tour } from '@/content/home';
import { type Layout, planTour, stopAt, type TourPlan } from '@/lib/tour-plan';
import { useMediaQuery } from '@/lib/use-media-query';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import type { CabinetData } from './cabinet-types';
import { Entrance, type EntranceFrame, type EntranceMotion } from './Entrance';
import { Gallery, stopAnchorId } from './Gallery';
import styles from './StoreTour.module.css';

/** Strong ease-in-out for on-screen movement (matches `--ease-in-out`). */
const easeInOut = cubicBezier(0.77, 0, 0.175, 1);
/** Strong ease-out (matches `--ease-out`). */
const easeOut = cubicBezier(0.23, 1, 0.32, 1);
/** Gathers pace as you step through the window. */
const easeIn = cubicBezier(0.55, 0, 0.9, 0.4);
const linear = (t: number) => t;

/**
 * The virtual store: a pinned stage whose layers are driven by scroll. Times
 * below are scroll positions in svh from the top of the tour.
 *
 *     0–100   the arch on the gallery wall opens onto the shopfront;
 *             the framed photographs slide away
 *   100–162   "Welcome to Perfume Hut", over the facade
 *   158–209   you walk through the window: the facade rushes past and blurs
 *   166–238   the marble gallery comes up around you
 *   238–      the floor's lights come up; scrolling walks you to each house's
 *             cabinet in turn
 *             (the stops come from lib/tour-plan.ts)
 *
 * Only transform, opacity, blur and the arch's clip animate. On the floor the
 * camera also glances towards the pointer, and the lights come up as you
 * arrive. Each stop's placard (or Ava, when she's on) changes per stop, not
 * per frame.
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
  // A light spring gives the camera weight without lagging behind the scroll.
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.3 });

  const [arrived, setArrived] = useState(false);
  const [stop, setStop] = useState({ index: 0, moving: false });
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const position = value * plan.length;
    setArrived(position >= plan.arrival);
    const next = stopAt(plan, position);
    setStop((current) =>
      current.index === next.index && current.moving === next.moving ? current : next,
    );
  });

  const look = usePointerLook(!reduced);
  const motionStyles = useTourMotion(progress, plan, look);
  const trackStyle = { '--tour-length': plan.length } as CSSProperties;

  return (
    <section
      ref={trackRef}
      className={styles.track}
      style={trackStyle}
      data-reduced={reduced || undefined}
      aria-label="Virtual tour of the Perfume Hut store"
    >
      {/* Where "Skip the walk-in" lands: the first stop on the floor. */}
      <span
        id="aisles"
        className={styles.anchor}
        style={{ '--at': plan.stops[0]!.hold[0] } as CSSProperties}
      />
      {!reduced &&
        plan.stops.map((planned, index) => (
          <span
            key={index}
            id={stopAnchorId(index)}
            className={styles.stopAnchor}
            style={{ '--at': (planned.hold[0] + planned.hold[1]) / 2 } as CSSProperties}
          />
        ))}
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

        <Gallery
          cabinets={cabinets}
          plan={plan}
          layout={layout}
          motionStyles={reduced ? undefined : motionStyles.gallery}
          stop={stop}
          arrived={arrived || reduced}
        />
      </div>
    </section>
  );
}

/** How far the camera turns towards the pointer, at the screen's edge (degrees). */
const LOOK = { yaw: 2.6, pitch: 1.6 };

/**
 * The camera glances a little towards a mouse, on a soft spring, so the room
 * shifts around you like a real space. Touch and reduced motion stay still.
 */
function usePointerLook(enabled: boolean) {
  const spring = { stiffness: 50, damping: 16, mass: 0.8 };
  const yaw = useSpring(0, spring);
  const pitch = useSpring(0, spring);

  useEffect(() => {
    if (!enabled) return;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      yaw.set((event.clientX / window.innerWidth - 0.5) * 2 * LOOK.yaw);
      pitch.set(-(event.clientY / window.innerHeight - 0.5) * 2 * LOOK.pitch);
    };
    const onLeave = () => {
      yaw.set(0);
      pitch.set(0);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled, yaw, pitch]);

  return { yaw, pitch };
}

function useTourMotion(
  progress: MotionValue<number>,
  plan: TourPlan,
  look: { yaw: MotionValue<number>; pitch: MotionValue<number> },
) {
  // Keyframes are written in svh of scroll; progress runs 0–1 over the tour.
  const f = (positions: number[]) => positions.map((position) => position / plan.length);

  // The doorway: its clip opens (0 → 1) onto the whole shopfront.
  const open = useTransform(progress, f([14, 101]), [0, 1], { ease: easeInOut });
  // The camera drifts towards the window, then walks through it.
  const sceneScale = useTransform(progress, f([14, 101, 158, 209]), [1, 1.05, 1.16, 2.8], {
    ease: [easeInOut, linear, easeIn],
  });
  const sceneBlur = useTransform(progress, f([166, 209]), [0, 10]);
  const portalOpacity = useTransform(progress, f([180, 209]), [1, 0]);
  // The wall is covered by the shopfront by now; dropping it lets what's behind show.
  const wallOpacity = useTransform(progress, f([97, 101]), [1, 0]);

  // You walk past the photographs: they slide off the wall rather than fade.
  const galleryX = useTransform(progress, f([7, 86]), [0, -44], { ease: easeInOut });
  const galleryOpacity = useTransform(progress, f([58, 86]), [1, 0]);
  const casingOpacity = useTransform(progress, f([11, 36]), [1, 0]);
  const cueOpacity = useTransform(progress, f([0, 14]), [1, 0]);

  const welcomeOpacity = useTransform(progress, f([101, 119, 144, 162]), [0, 1, 1, 0]);
  const welcomeRise = useTransform(progress, f([101, 122]), [2.4, 0]);

  // The gallery comes up through the blur of the window you walked through.
  const revealOpacity = useTransform(progress, f(plan.reveal), [0, 1]);
  const revealBlur = useTransform(progress, f([plan.reveal[0], plan.reveal[1] + 12]), [12, 0]);

  // The walk round the floor: hold still at each stop, ease between them.
  const { at, cameras, moving } = plan.keys;
  const keys = f(at);
  const ease: EasingFunction[] = at.slice(1).map((_, i) => {
    if (i === 0) return easeOut;
    return moving[i + 1] ? easeInOut : linear;
  });
  const camX = useTransform(
    progress,
    keys,
    cameras.map((c) => -c.x),
    { ease },
  );
  const camY = useTransform(
    progress,
    keys,
    cameras.map((c) => -c.y),
    { ease },
  );
  const camZ = useTransform(
    progress,
    keys,
    cameras.map((c) => -c.z),
    { ease },
  );
  const walkYaw = useTransform(
    progress,
    keys,
    cameras.map((c) => c.yaw),
    { ease },
  );
  const yaw = useTransform(() => walkYaw.get() + look.yaw.get());

  // Full transform strings keep the work on the compositor.
  const scene = useMotionTemplate`scale(${sceneScale})`;
  const sceneFilter = useMotionTemplate`blur(${sceneBlur}px)`;
  const gallery = useMotionTemplate`translateX(${galleryX}cqw)`;
  const welcome = useMotionTemplate`translateY(${welcomeRise}rem)`;
  const revealFilter = useMotionTemplate`blur(${revealBlur}px)`;
  const camera = useMotionTemplate`translateZ(100cqh) rotateX(${look.pitch}deg) rotateY(${yaw}deg) translate3d(${camX}cqh, ${camY}cqh, ${camZ}cqh)`;

  const entrance: EntranceMotion = {
    // Motion drives CSS variables at runtime; its style type just doesn't list them.
    portal: { '--open': open, opacity: portalOpacity } as MotionStyle,
    scene: { transform: scene, filter: sceneFilter },
    wall: { opacity: wallOpacity },
    gallery: { transform: gallery, opacity: galleryOpacity },
    casing: { opacity: casingOpacity },
    cue: { opacity: cueOpacity },
  };

  return {
    entrance,
    welcome: { transform: welcome, opacity: welcomeOpacity } as MotionStyle,
    welcomeScrim: { opacity: welcomeOpacity } as MotionStyle,
    gallery: {
      camera: { transform: camera } as MotionStyle,
      reveal: { opacity: revealOpacity, filter: revealFilter } as MotionStyle,
    },
  };
}
