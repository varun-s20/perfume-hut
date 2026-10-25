'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type PointerEvent, useEffect, useEffectEvent, useRef, useState } from 'react';
import { ArrowRightIcon, CloseIcon } from '@/components/icons';
import { stories as content } from '@/content/stories';
import { dispatchCart } from '@/lib/cart-store';
import { PlayGlyph, type ReelStory } from './story-parts';
import styles from './StoryViewer.module.css';

type StoryViewerProps = {
  stories: readonly ReelStory[];
  start: number;
  onClose: () => void;
};

/** A press held this long pauses the film instead of moving on (ms). */
const HOLD_MS = 220;
/** A downward drag this far closes the viewer on a phone (px). */
const SWIPE_CLOSE = 110;
const SWIPE_SIDEWAYS = 60;
/** The viewer takes this long to leave (matches `viewer-out`). */
const CLOSE_MS = 200;
const ADDED_MS = 1600;

/**
 * Customer films, full screen, one after another like stories: a bar per
 * film fills as it plays, a tap on the right moves on and on the left goes
 * back, a held press pauses, and a swipe down (or Esc) closes. Their words
 * run beneath the film, with the bottle they're talking about ready to add.
 */
export function StoryViewer({ stories, start, onClose }: StoryViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const press = useRef<{ x: number; y: number; at: number; held: boolean; timer: number } | null>(
    null,
  );
  const [index, setIndex] = useState(start);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [added, setAdded] = useState(false);
  const [closing, setClosing] = useState(false);
  const story = stories[index]!;

  const leave = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      dialogRef.current?.close();
      onClose();
    }, CLOSE_MS);
  };
  const go = (step: number) => {
    const next = index + step;
    if (next < 0) {
      if (videoRef.current) videoRef.current.currentTime = 0;
      return;
    }
    if (next >= stories.length) return leave();
    setIndex(next);
    setPaused(false);
    setAdded(false);
  };

  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(1);
    if (event.key === 'ArrowLeft') go(-1);
    if (event.key === ' ') {
      event.preventDefault();
      setPaused((value) => !value);
    }
  });

  // Open as a modal (focus trap and Esc from the platform), and lock the page.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const handler = (event: KeyboardEvent) => onKey(event);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      if (dialog.open) dialog.close();
    };
  }, []);

  // Play the film you're on; the bar fills with it.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();
    else void video.play().catch(() => setPaused(true));
  }, [index, paused]);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const video = videoRef.current;
      const fill = fillRef.current;
      if (video && fill && video.duration) {
        fill.style.transform = `scaleX(${Math.min(1, video.currentTime / video.duration)})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [index]);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), ADDED_MS);
    return () => window.clearTimeout(timer);
  }, [added]);

  // Tap to move on or back, hold to pause, swipe down to close.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const timer = window.setTimeout(() => {
      if (press.current) press.current.held = true;
      videoRef.current?.pause();
    }, HOLD_MS);
    press.current = { x: event.clientX, y: event.clientY, at: Date.now(), held: false, timer };
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = press.current;
    press.current = null;
    if (!start) return;
    window.clearTimeout(start.timer);
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (dy > SWIPE_CLOSE) return leave();
    if (Math.abs(dx) > SWIPE_SIDEWAYS) return go(dx < 0 ? 1 : -1);
    if (start.held) {
      if (!paused) void videoRef.current?.play().catch(() => {});
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    go(event.clientX - rect.left < rect.width * 0.35 ? -1 : 1);
  };

  const add = () => {
    dispatchCart({ type: 'add', slug: story.product.slug, ml: story.product.ml });
    setAdded(true);
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.viewer}
      data-closing={closing || undefined}
      aria-label={content.eyebrow}
      onCancel={(event) => {
        event.preventDefault();
        leave();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) leave();
      }}
    >
      <button
        type="button"
        className={`${styles.step} ${styles.stepBack}`}
        onClick={() => go(-1)}
        aria-label={content.viewer.previous}
        disabled={index === 0}
      >
        <ArrowRightIcon />
      </button>

      <div className={styles.stage}>
        {/* Keyed per story, so each film arrives fresh. */}
        <div key={story.id} className={styles.film}>
          <Image
            src={story.poster}
            alt=""
            fill
            sizes="(max-width: 959px) 100vw, 50vh"
            placeholder="blur"
            className={styles.poster}
          />
          <video
            ref={videoRef}
            className={styles.video}
            src={story.video}
            muted={muted || !story.sound}
            playsInline
            autoPlay
            onEnded={() => go(1)}
            aria-hidden="true"
          />
        </div>

        <div
          className={styles.taps}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            if (press.current) window.clearTimeout(press.current.timer);
            press.current = null;
          }}
          aria-hidden="true"
        />

        <div className={styles.top}>
          <ol className={styles.bars} aria-hidden="true">
            {stories.map((item, i) => (
              <li key={item.id} className={styles.bar}>
                {/* Re-keyed as the story changes, so going back empties the bar again. */}
                <span
                  key={i < index ? 'done' : i === index ? 'now' : 'next'}
                  ref={i === index ? fillRef : undefined}
                  className={styles.barFill}
                  style={{ transform: `scaleX(${i < index ? 1 : 0})` }}
                />
              </li>
            ))}
          </ol>
          <div className={styles.who}>
            <span className={styles.avatar} aria-hidden="true">
              {story.name.charAt(0)}
            </span>
            <p className={styles.name}>
              {story.name}
              <span className={styles.place}>{story.place}</span>
            </p>
            <div className={styles.controls}>
              <button
                type="button"
                className={styles.control}
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? content.viewer.play : content.viewer.pause}
              >
                {paused ? <PlayGlyph /> : <PauseGlyph />}
              </button>
              {story.sound && (
                <button
                  type="button"
                  className={styles.control}
                  onClick={() => setMuted((value) => !value)}
                  aria-label={muted ? content.viewer.sound.off : content.viewer.sound.on}
                >
                  <SoundGlyph muted={muted} />
                </button>
              )}
              <button
                type="button"
                className={styles.control}
                onClick={leave}
                aria-label={content.viewer.close}
                autoFocus
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>

        <div key={`${story.id}-words`} className={styles.bottom}>
          <p className={styles.quote}>
            <span className="visually-hidden">{story.name} says: </span>
            {story.quote}
          </p>
          <div className={styles.product}>
            <span className={styles.thumb}>
              <Image src={story.product.image} alt="" sizes="56px" className={styles.thumbImage} />
            </span>
            <span className={styles.productText}>
              <span className={styles.productBrand}>{story.product.brand}</span>
              <span className={styles.productName}>
                {story.product.name}
                <span className={styles.productMeta}>
                  {story.product.concentration} · {story.product.price}
                </span>
              </span>
            </span>
            <span className={styles.productActions}>
              <button
                type="button"
                className={styles.add}
                onClick={add}
                disabled={!story.product.inStock}
                data-added={added || undefined}
              >
                {added ? content.viewer.added : content.viewer.add}
              </button>
              <Link href={story.product.href} className={styles.view} onClick={() => onClose()}>
                {content.viewer.view}
              </Link>
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.step} ${styles.stepNext}`}
        onClick={() => go(1)}
        aria-label={content.viewer.next}
      >
        <ArrowRightIcon />
      </button>
    </dialog>
  );
}

function PauseGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <rect x="6.5" y="5" width="3.6" height="14" rx="1" />
      <rect x="13.9" y="5" width="3.6" height="14" rx="1" />
    </svg>
  );
}

function SoundGlyph({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor" stroke="none" />
      {muted ? (
        <path d="m16 9.5 5 5m0-5-5 5" />
      ) : (
        <path d="M16 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
      )}
    </svg>
  );
}
