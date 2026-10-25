'use client';

import { motion, type MotionStyle, type MotionValue, useMotionValueEvent } from 'motion/react';
import { type MouseEvent, type PointerEvent, useEffect, useRef, useState } from 'react';
import marbleFloor from '@/assets/images/store/marble-floor.jpg';
import { storeFloor } from '@/content/home';
import { brandHref } from '@/content/routes';
import { flags } from '@/lib/flags';
import type { Layout, TourPlan } from '@/lib/tour-plan';
import { AvaGuide } from './AvaGuide';
import { CabinetRoom } from './CabinetRoom';
import type { CabinetData } from './cabinet-types';
import { FloorCaption } from './FloorCaption';
import { pageFonts } from './store3d/page-fonts';
import type { Hit, StoreScene } from './store3d/StoreScene';
import styles from './StoreFloor.module.css';

type StoreFloorProps = {
  cabinets: readonly CabinetData[];
  plan: TourPlan;
  layout: Layout;
  /** Raw scroll progress through the tour (0–1); the store smooths it itself. */
  progress: MotionValue<number>;
  /** The floor fading up as you step through the window. */
  revealStyle?: MotionStyle;
  stop: { index: number; moving: boolean };
  arrived: boolean;
  /** Past the last cabinet: the words step aside for the last look down the floor. */
  ended: boolean;
  /** Reduced motion: no walk; the floor stands still and lists its houses. */
  still: boolean;
  onJump: (cabinet: number) => void;
};

/**
 * The store floor: slate-panelled like the shopfront outside, a cabinet for
 * every house down both walls, built in WebGL (store3d/) so the bottles are
 * real 3D and the walk stays smooth on a phone. Scrolling walks you round;
 * the captions say where you are; tapping a case (or "Step inside") walks you
 * up to it and opens its doors.
 */
export function StoreFloor({
  cabinets,
  plan,
  layout,
  progress,
  revealStyle,
  stop,
  arrived,
  ended,
  still,
  onJump,
}: StoreFloorProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<StoreScene | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [pointing, setPointing] = useState(false);
  const openCabinet = cabinets.find((cabinet) => cabinet.slug === openSlug);
  const positionOf = (value: number) => (still ? plan.stops[0]!.at : value * plan.length);

  // Build the store once; the rest is fed to it as it changes. Each build gets
  // a canvas of its own, so a rebuild never shares a WebGL context with the last.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const canvas = document.createElement('canvas');
    canvas.className = styles.canvas!;
    canvas.setAttribute('aria-hidden', 'true');
    view.prepend(canvas);
    let cancelled = false;
    let scene: StoreScene | undefined;
    import('./store3d/StoreScene')
      .then(({ StoreScene }) =>
        StoreScene.create(canvas, {
          cabinets: cabinets.map((cabinet) => ({
            slug: cabinet.slug,
            name: cabinet.name,
            number: cabinet.number,
            tagline: cabinet.tagline,
            bottles: cabinet.bottles.map((bottle) => ({ slug: bottle.slug, name: bottle.name })),
          })),
          plan,
          layout,
          fonts: pageFonts(),
          marble: marbleFloor.src,
          reduced: still,
        }),
      )
      .then((created) => {
        if (cancelled) return created.dispose();
        scene = created;
        sceneRef.current = created;
        created.setPosition(positionOf(progress.get()));
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('failed');
      });
    return () => {
      cancelled = true;
      scene?.dispose();
      sceneRef.current = null;
      canvas.remove();
    };
    // Built once per set of cabinets; plan, layout and scroll are fed in below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cabinets, still]);

  useEffect(() => sceneRef.current?.setPlan(plan, layout), [plan, layout, status]);
  useEffect(() => sceneRef.current?.setLit(arrived || still), [arrived, still, status]);
  useMotionValueEvent(progress, 'change', (value) =>
    sceneRef.current?.setPosition(positionOf(value)),
  );

  // Size to the stage, and stop drawing altogether while it's off screen.
  useEffect(() => {
    const view = viewRef.current;
    const scene = sceneRef.current;
    if (!view || !scene) return;
    const resize = new ResizeObserver(([entry]) => {
      if (entry) scene.resize(entry.contentRect.width, entry.contentRect.height);
    });
    const onScreen = new IntersectionObserver(([entry]) =>
      scene.setVisible(Boolean(entry?.isIntersecting)),
    );
    resize.observe(view);
    onScreen.observe(view);
    return () => {
      resize.disconnect();
      onScreen.disconnect();
    };
  }, [status]);

  // On a mouse, the camera glances a little towards the pointer.
  useEffect(() => {
    if (still || status !== 'ready') return;
    const onPointerMove = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      sceneRef.current?.setLook(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      );
    };
    const onLeave = () => sceneRef.current?.setLook(0, 0);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [still, status]);

  const open = (slug: string | null) => {
    if (slug && status === 'failed') {
      // Without the 3D store, a house's cabinet is its aisle.
      window.location.assign(brandHref(slug));
      return;
    }
    setOpenSlug(slug);
    sceneRef.current?.setOpen(slug ? cabinets.findIndex((cabinet) => cabinet.slug === slug) : -1);
  };

  const pick = (clientX: number, clientY: number): Hit | null => {
    const view = viewRef.current;
    const scene = sceneRef.current;
    if (!view || !scene) return null;
    const rect = view.getBoundingClientRect();
    return scene.pick(clientX - rect.left, clientY - rect.top);
  };

  // Pointing at a case on the floor lifts its lights; tapping it steps inside.
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || openSlug) return;
    const hit = arrived ? pick(event.clientX, event.clientY) : null;
    sceneRef.current?.setHover(hit);
    setPointing(Boolean(hit));
  };
  const onClick = (event: MouseEvent) => {
    if (!arrived && !still) return;
    const hit = pick(event.clientX, event.clientY);
    if (hit?.kind === 'cabinet') open(cabinets[hit.index]!.slug);
  };

  const current = plan.stops[stop.index]!;
  const words = arrived && !ended && !openSlug;

  return (
    <div className={styles.floor} data-still={still || undefined} data-status={status}>
      <motion.div
        ref={viewRef}
        className={styles.viewport}
        style={still ? undefined : revealStyle}
        data-pointing={pointing || undefined}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          sceneRef.current?.setHover(null);
          setPointing(false);
        }}
        onClick={onClick}
      >
        {/* The store's canvas goes here (see the effect above). */}
        <span className={styles.vignette} aria-hidden="true" />
      </motion.div>

      {flags.ava ? (
        <AvaGuide
          cabinets={cabinets}
          plan={plan}
          layout={layout}
          stop={still ? { index: 0, moving: false } : stop}
          arrived={arrived || still}
          paused={Boolean(openSlug)}
          still={still}
          onOpen={open}
        />
      ) : (
        <FloorCaption
          stop={still ? plan.stops[0]! : current}
          cabinets={cabinets}
          visible={still ? !openSlug : words}
          still={still || status === 'failed'}
          onOpen={open}
          onJump={onJump}
        />
      )}

      {!still && arrived && !openSlug && (
        <a href="#tour-end" className={styles.skip}>
          {storeFloor.skip}
        </a>
      )}

      {openCabinet && (
        <CabinetRoom
          cabinet={openCabinet}
          pick={pick}
          onHover={(hit) => sceneRef.current?.setHover(hit)}
          onHighlight={(slug) => sceneRef.current?.setHighlight(slug)}
          onClose={() => open(null)}
        />
      )}
    </div>
  );
}
