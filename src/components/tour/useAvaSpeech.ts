'use client';

import { useEffect, useEffectEvent, useMemo, useState } from 'react';
import { cueAt, type MouthFrame, mouthAt, planSpeech } from '@/lib/ava-speech';

type Options = {
  /** Start (or keep) speaking. */
  play: boolean;
  /** Move the lips; off for reduced motion (subtitles still advance). */
  lipSync: boolean;
  onDone?: () => void;
};

/**
 * Plays one of Ava's lines: the subtitle on screen and the mouth shape, in step.
 * A new line starts from the top. State only changes when the cue or mouth
 * frame does, so the animation loop doesn't re-render every frame.
 */
export function useAvaSpeech(text: string, { play, lipSync, onDone }: Options) {
  const plan = useMemo(() => planSpeech(text), [text]);
  const [cue, setCue] = useState(0);
  const [frame, setFrame] = useState<MouthFrame>(0);
  const [done, setDone] = useState(false);
  const [take, setTake] = useState(0);
  const [spoken, setSpoken] = useState(text);
  const finish = useEffectEvent(() => onDone?.());

  // A new line: back to its first subtitle.
  if (text !== spoken) {
    setSpoken(text);
    setCue(0);
    setFrame(0);
    setDone(false);
  }

  useEffect(() => {
    if (!play) return;
    let raf = 0;
    let start = -1;
    const tick = (now: number) => {
      if (start < 0) start = now;
      const t = now - start;
      setCue(cueAt(plan, t));
      if (t >= plan.duration) {
        setFrame(0);
        setDone(true);
        finish();
        return;
      }
      setFrame(lipSync ? mouthAt(plan, t) : 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [plan, play, lipSync, take]);

  return {
    caption: plan.cues[cue]?.text ?? '',
    cueIndex: cue,
    frame,
    speaking: play && !done,
    replay: () => {
      setDone(false);
      setCue(0);
      setTake((value) => value + 1);
    },
  };
}
