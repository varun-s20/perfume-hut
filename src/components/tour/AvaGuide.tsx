'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { type CSSProperties, useState } from 'react';
import { ArrowRightIcon } from '@/components/icons';
import { ava } from '@/content/home';
import type { AvaPoseName } from '@/data/ava-poses';
import type { Layout, Stop, TourPlan } from '@/lib/tour-plan';
import { AvaFigure } from './AvaFigure';
import styles from './AvaGuide.module.css';
import { AvaSubtitles } from './AvaSubtitles';
import type { CabinetData } from './cabinet-types';
import { useAvaSpeech } from './useAvaSpeech';

/*
 * Ava leading the walk round the floor. Only rendered when `flags.ava` is
 * on (lib/flags.ts); while she's off, the Placard speaks for each stop.
 */

function lineFor(stop: Stop, cabinets: readonly CabinetData[]): string {
  if (stop.kind === 'intro') return ava.floor.intro.line;
  if (stop.kind === 'outro') return ava.floor.outro.line;
  const cabinet = cabinets[stop.cabinet]!;
  const pick = cabinet.bottles.find((bottle) => bottle.bestseller) ?? cabinet.bottles[0];
  const { first, last, houses } = ava.floor;
  const say =
    stop.cabinet === 0
      ? first
      : stop.cabinet === cabinets.length - 1
        ? last
        : houses[(stop.cabinet - 1) % houses.length]!;
  return say(cabinet.name, cabinet.tagline, pick?.name ?? 'anything here');
}

function poseFor(stop: Stop, moving: boolean): AvaPoseName {
  if (moving) return ava.floor.walkPose;
  if (stop.kind === 'intro') return ava.floor.intro.pose;
  if (stop.kind === 'outro') return ava.floor.outro.pose;
  return ava.floor.housePoses[stop.cabinet % ava.floor.housePoses.length]!;
}

const SIDE_SHIFT: Record<Layout, number> = { wide: 31, narrow: 22 };

export function AvaGuide({
  cabinets,
  plan,
  layout,
  stop: { index, moving },
  arrived,
  paused,
  still,
  onOpen,
}: {
  cabinets: readonly CabinetData[];
  plan: TourPlan;
  layout: Layout;
  stop: { index: number; moving: boolean };
  arrived: boolean;
  paused: boolean;
  still: boolean;
  onOpen: (slug: string) => void;
}) {
  const stop = plan.stops[index]!;
  const line = lineFor(stop, cabinets);
  const [doneLine, setDoneLine] = useState<string | null>(null);
  const speech = useAvaSpeech(line, {
    play: arrived && !paused,
    lipSync: !still,
    onDone: () => setDoneLine(line),
  });
  const ready = doneLine === line;
  const side = still ? 'left' : stop.side;
  const cabinet = stop.kind === 'cabinet' ? cabinets[stop.cabinet] : undefined;

  return (
    <>
      <motion.div
        className={styles.ava}
        data-visible={arrived}
        initial={false}
        animate={{
          transform: `translateX(${side === 'left' ? -SIDE_SHIFT[layout] : SIDE_SHIFT[layout]}cqw)`,
        }}
        transition={{ type: 'spring', duration: 1.1, bounce: 0.08 }}
      >
        <AvaFigure
          pose={poseFor(stop, moving && !still)}
          facing={side === 'left' ? 'right' : 'left'}
          frame={speech.frame}
          speaking={speech.speaking}
          moving={moving && !still}
          sizes="(max-width: 959px) 60vw, 50vw"
        />
      </motion.div>

      <div className={styles.subtitles} data-visible={arrived}>
        <AvaSubtitles
          line={line}
          caption={speech.caption}
          cueIndex={speech.cueIndex}
          play={arrived}
          speaking={speech.speaking}
          onReplay={speech.replay}
          ready={ready}
        >
          {stop.kind === 'intro' && !still && (
            <span className={styles.hint} style={{ '--i': 0 } as CSSProperties}>
              {ava.floor.scrollHint}
            </span>
          )}
          {cabinet && (
            <button
              type="button"
              className={styles.primary}
              style={{ '--i': 0 } as CSSProperties}
              onClick={() => onOpen(cabinet.slug)}
              tabIndex={ready ? undefined : -1}
            >
              {ava.floor.stepInside(cabinet.name)}
              <ArrowRightIcon className={styles.primaryArrow} />
            </button>
          )}
          {(cabinet || stop.kind === 'outro' || still) && (
            <Link
              href={ava.floor.browseAll.href}
              className={styles.secondary}
              style={{ '--i': 1 } as CSSProperties}
              tabIndex={ready ? undefined : -1}
            >
              {ava.floor.browseAll.label}
            </Link>
          )}
        </AvaSubtitles>
      </div>
    </>
  );
}
