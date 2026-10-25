'use client';

import Link from 'next/link';
import { type CSSProperties, type ReactNode, useState } from 'react';
import { ArrowRightIcon } from '@/components/icons';
import { ava } from '@/content/home';
import { brandHref } from '@/content/routes';
import {
  firstSentence,
  moodChoices,
  type Recommendation,
  recommend,
  speakNotes,
  type Who,
  whoChoices,
} from '@/lib/ava';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import { AvaFigure } from './AvaFigure';
import styles from './AvaConversation.module.css';
import { AvaSubtitles } from './AvaSubtitles';
import type { CabinetData, ShelfBottle } from './cabinet-types';
import { useAvaSpeech } from './useAvaSpeech';

/*
 * Ava in a cabinet room (only while `flags.ava` is on, lib/flags.ts): a short
 * guided conversation — who it's for, how it should feel — then her pick.
 */

type Step =
  | { kind: 'who' }
  | { kind: 'mood'; who: Who }
  | { kind: 'pick'; recommendation: Recommendation<ShelfBottle> };

export function AvaConversation({
  cabinet,
  onPick,
}: {
  cabinet: CabinetData;
  /** Her pick, to highlight on the shelves (undefined while she's still asking). */
  onPick: (slug: string | undefined) => void;
}) {
  const [step, setStep] = useState<Step>({ kind: 'who' });
  const line =
    step.kind === 'who'
      ? ava.room.hello(cabinet.name, cabinet.tagline)
      : step.kind === 'mood'
        ? ava.room.mood
        : pickLine(step.recommendation);

  const reduced = usePrefersReducedMotion();
  // Replies appear once Ava has finished her line, as in conversation.
  const [ready, setReady] = useState(false);
  const speech = useAvaSpeech(line, {
    play: true,
    lipSync: !reduced,
    onDone: () => setReady(true),
  });

  const goTo = (next: Step) => {
    setReady(false);
    setStep(next);
    onPick(next.kind === 'pick' ? next.recommendation.product.slug : undefined);
  };
  const pickFor = (recommendation: Recommendation<ShelfBottle> | undefined) => {
    if (recommendation) goTo({ kind: 'pick', recommendation });
  };

  return (
    <>
      <div className={styles.ava}>
        <AvaFigure
          pose={ava.room.poses[step.kind]}
          facing="right"
          frame={speech.frame}
          speaking={speech.speaking}
          sizes="(max-width: 959px) 60vw, 46vw"
        />
      </div>

      <AvaSubtitles
        className={styles.subtitles}
        line={line}
        caption={speech.caption}
        cueIndex={speech.cueIndex}
        play
        speaking={speech.speaking}
        onReplay={speech.replay}
        ready={ready}
      >
        <>
          {step.kind === 'who' &&
            whoChoices(cabinet.bottles).map((who, index) => (
              <Reply key={who} index={index} onClick={() => goTo({ kind: 'mood', who })}>
                {ava.room.who[who]}
              </Reply>
            ))}

          {step.kind === 'mood' && (
            <>
              {moodChoices(cabinet.bottles, step.who).map((family, index) => (
                <Reply
                  key={family}
                  index={index}
                  onClick={() => pickFor(recommend(cabinet.bottles, step.who, family))}
                >
                  {ava.room.moods[family]}
                </Reply>
              ))}
              <Reply
                index={moodChoices(cabinet.bottles, step.who).length}
                onClick={() => pickFor(recommend(cabinet.bottles, step.who))}
              >
                {ava.room.surprise}
              </Reply>
            </>
          )}

          {step.kind === 'pick' && (
            <>
              <Link
                href={step.recommendation.product.href}
                transitionTypes={['nav-forward']}
                className={styles.primary}
                style={{ '--i': 0 } as CSSProperties}
                tabIndex={ready ? undefined : -1}
              >
                {ava.room.view(step.recommendation.product.name)}
                <ArrowRightIcon className={styles.replyArrow} />
              </Link>
              <Reply index={1} onClick={() => goTo({ kind: 'who' })}>
                {ava.room.again}
              </Reply>
              <Link
                href={brandHref(cabinet.slug)}
                transitionTypes={['walk-in']}
                className={styles.textLink}
                style={{ '--i': 2 } as CSSProperties}
                tabIndex={ready ? undefined : -1}
              >
                {ava.room.visit(cabinet.name)}
              </Link>
            </>
          )}
        </>
      </AvaSubtitles>
    </>
  );
}

function Reply({
  index,
  onClick,
  children,
}: {
  index: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={styles.reply}
      onClick={onClick}
      style={{ '--i': index } as CSSProperties}
    >
      {children}
    </button>
  );
}

function pickLine({ product, exact }: Recommendation): string {
  const line = ava.room.pick(
    `${product.name} ${product.concentration}`,
    firstSentence(product.description),
    speakNotes(product.top),
    speakNotes(product.base),
  );
  return exact ? line : `${ava.room.near} ${line}`;
}
