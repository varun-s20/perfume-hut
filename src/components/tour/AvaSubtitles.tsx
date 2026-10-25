import type { ReactNode } from 'react';
import { ava } from '@/content/home';
import { cx } from '@/lib/cx';
import styles from './AvaSubtitles.module.css';

type AvaSubtitlesProps = {
  /** The full line, for screen readers (read once, as a whole). */
  line: string;
  /** The subtitle currently on screen. */
  caption: string;
  cueIndex: number;
  play: boolean;
  speaking: boolean;
  onReplay: () => void;
  /** Replies or links that appear once she's finished. */
  children?: ReactNode;
  ready?: boolean;
  className?: string;
};

/** Ava's words as film subtitles, under the speaker's name, with a replay control. */
export function AvaSubtitles({
  line,
  caption,
  cueIndex,
  play,
  speaking,
  onReplay,
  children,
  ready = false,
  className,
}: AvaSubtitlesProps) {
  return (
    <div className={cx(styles.subtitles, className)} data-play={play}>
      {children && (
        <div className={styles.after} data-ready={ready}>
          {children}
        </div>
      )}

      <p className={styles.speaker}>
        <span className={styles.name}>{ava.name}</span>
        <span className={styles.dot} data-speaking={speaking} aria-hidden="true" />
        <button type="button" className={styles.replay} onClick={onReplay} disabled={speaking}>
          Replay
        </button>
      </p>

      <p className={styles.caption} aria-hidden="true">
        {play && (
          <span key={cueIndex} className={styles.cue}>
            {caption}
          </span>
        )}
      </p>
      <p className="visually-hidden" aria-live="polite">
        {play ? line : ''}
      </p>
    </div>
  );
}
