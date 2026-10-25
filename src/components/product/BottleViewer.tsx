'use client';

import { type PointerEvent, useEffect, useRef, useState } from 'react';
import type { BottleStage } from '@/components/tour/store3d/BottleStage';
import { pageFonts } from '@/components/tour/store3d/page-fonts';
import type { BottleSpec } from '@/data/bottles';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import styles from './BottleViewer.module.css';

type BottleViewerProps = {
  spec: BottleSpec;
  /** What the picture shows, for screen readers. */
  label: string;
};

/**
 * The bottle in 3D, as it stands in its cabinet in the store: it turns slowly
 * on a stone plinth, and a drag spins it (vertical swipes still scroll).
 */
export function BottleViewer({ spec, label }: BottleViewerProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<BottleStage | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    // A canvas per build, so a rebuild never shares a WebGL context with the last.
    const canvas = document.createElement('canvas');
    canvas.className = styles.canvas!;
    view.prepend(canvas);
    let cancelled = false;
    let stage: BottleStage | undefined;
    import('@/components/tour/store3d/BottleStage')
      .then(({ BottleStage }) => BottleStage.create(canvas, { spec, fonts: pageFonts(), reduced }))
      .then((created) => {
        if (cancelled) return created.dispose();
        stage = created;
        stageRef.current = created;
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('failed');
      });

    const resize = new ResizeObserver(([entry]) => {
      if (entry) stageRef.current?.resize(entry.contentRect.width, entry.contentRect.height);
    });
    const onScreen = new IntersectionObserver(([entry]) =>
      stageRef.current?.setVisible(Boolean(entry?.isIntersecting)),
    );
    resize.observe(view);
    onScreen.observe(view);
    return () => {
      cancelled = true;
      resize.disconnect();
      onScreen.disconnect();
      stage?.dispose();
      stageRef.current = null;
      canvas.remove();
    };
  }, [spec, reduced]);

  const down = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    stageRef.current?.pointerDown(event.clientX);
  };

  return (
    <div
      ref={viewRef}
      className={styles.viewer}
      data-status={status}
      role="img"
      aria-label={label}
      onPointerDown={down}
      onPointerMove={(event) => stageRef.current?.pointerMove(event.clientX)}
      onPointerUp={() => stageRef.current?.pointerUp()}
      onPointerCancel={() => stageRef.current?.pointerUp()}
    >
      {status === 'failed' && <p className={styles.failed}>3D isn’t available on this device.</p>}
    </div>
  );
}
