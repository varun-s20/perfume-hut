'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { ArrowRightIcon } from '@/components/icons';
import { stories as content } from '@/content/stories';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import { PlayGlyph, type ReelStory } from './story-parts';
import styles from './StoryReel.module.css';
import { StoryViewer } from './StoryViewer';

export type { ReelStory } from './story-parts';

/** On a mouse, every film in view plays; on a phone, only the one you've swiped to. */
const POINTER_QUERY = '(hover: hover) and (pointer: fine)';

/**
 * The reel of customer films. They play muted while the reel is on screen
 * (or, on a phone, the one in the middle of the row), and show their poster
 * otherwise. Tapping one opens the full-screen viewer at that story.
 */
export function StoryReel({ stories }: { stories: readonly ReelStory[] }) {
  const reelRef = useRef<HTMLUListElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = useState<ReadonlySet<number>>(new Set());
  const [ready, setReady] = useState<ReadonlySet<number>>(new Set());
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel || reduced) return;
    const films = videos.current;
    const pointer = window.matchMedia(POINTER_QUERY).matches;
    let onScreen = false;
    const centred = new Set<number>();

    const sync = () => {
      const next = new Set<number>();
      if (onScreen && open === null) {
        if (pointer) stories.forEach((_, index) => next.add(index));
        else centred.forEach((index) => next.add(index));
      }
      films.forEach((video, index) => {
        if (!video) return;
        if (next.has(index)) void video.play().catch(() => {});
        else video.pause();
      });
      setPlaying(next);
    };

    // Is the reel on screen at all?
    const page = new IntersectionObserver(
      ([entry]) => {
        onScreen = Boolean(entry?.isIntersecting);
        sync();
      },
      { threshold: 0.25 },
    );
    page.observe(reel);

    // Which card is in the middle of the row (phones swipe along it).
    const row = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (entry.intersectionRatio >= 0.65) centred.add(index);
          else centred.delete(index);
        }
        const first = Math.min(...centred);
        if (Number.isFinite(first)) setCurrent(first);
        if (!pointer) {
          // Only one at a time on a phone: the first that's fully in view.
          for (const index of [...centred]) if (index !== first) centred.delete(index);
        }
        sync();
      },
      { root: reel, threshold: [0, 0.65, 1] },
    );
    reel.querySelectorAll('[data-index]').forEach((card) => row.observe(card));

    return () => {
      page.disconnect();
      row.disconnect();
      films.forEach((video) => video?.pause());
    };
  }, [stories, reduced, open]);

  const goTo = (index: number) => {
    const card = reelRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    card?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      inline: 'start',
      block: 'nearest',
    });
  };

  return (
    <>
      <ul ref={reelRef} className={styles.reel} aria-label={content.eyebrow}>
        {stories.map((story, index) => (
          <li
            key={story.id}
            data-index={index}
            className={styles.item}
            style={{ '--i': index } as CSSProperties}
          >
            <button
              type="button"
              className={styles.card}
              data-playing={playing.has(index) || undefined}
              onClick={() => setOpen(index)}
              aria-label={content.watch(story.name)}
            >
              <Image
                src={story.poster}
                alt=""
                fill
                sizes="(max-width: 959px) 70vw, 18vw"
                placeholder="blur"
                className={styles.poster}
              />
              <video
                ref={(element) => {
                  videos.current[index] = element;
                }}
                className={styles.video}
                data-ready={ready.has(index) || undefined}
                onPlaying={() => setReady((current) => new Set(current).add(index))}
                src={story.video}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
              />
              <span className={styles.shade} aria-hidden="true" />
              <span className={styles.play} aria-hidden="true">
                <PlayGlyph />
              </span>
              <span className={styles.words} aria-hidden="true">
                <span className={styles.quote}>“{story.quote}”</span>
                <span className={styles.who}>
                  {story.name} <span className={styles.place}>· {story.place}</span>
                </span>
              </span>
            </button>

            <Link
              href={story.product.href}
              transitionTypes={['nav-forward']}
              className={styles.bottle}
            >
              <span className={styles.thumb}>
                <Image
                  src={story.product.image}
                  alt=""
                  sizes="48px"
                  className={styles.thumbImage}
                />
              </span>
              <span className={styles.bottleText}>
                <span className={styles.bottleBrand}>{story.product.brand}</span>
                <span className={styles.bottleName}>{story.product.name}</span>
              </span>
              <span className={styles.bottlePrice}>{story.product.price}</span>
              <ArrowRightIcon className={styles.bottleArrow} />
            </Link>
          </li>
        ))}
      </ul>

      {/* Phones: where you are along the row. */}
      <ol className={styles.dots} aria-label="Stories">
        {stories.map((story, index) => (
          <li key={story.id}>
            <button
              type="button"
              className={styles.dot}
              data-active={index === current || undefined}
              aria-label={`${story.name}’s story`}
              aria-current={index === current ? 'true' : undefined}
              onClick={() => goTo(index)}
            />
          </li>
        ))}
      </ol>

      {open !== null && (
        <StoryViewer stories={stories} start={open} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
