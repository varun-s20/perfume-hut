import { describe, expect, it } from 'vitest';
import { cueAt, mouthAt, planSpeech, shelve } from './ava-speech';

const greeting =
  'Hi, I’m Ava — welcome to Perfume Hut. What are we looking for today? Every house has its own cabinet. Choose one and I’ll walk you through it.';

describe('planSpeech', () => {
  const plan = planSpeech(greeting);

  it('covers the whole line, in order, across its cues', () => {
    expect(plan.cues.map((cue) => cue.text).join(' ')).toBe(greeting);
  });

  it('keeps every subtitle short enough to read', () => {
    for (const cue of plan.cues) expect(cue.text.length).toBeLessThanOrEqual(64);
  });

  it('splits a long sentence evenly, never leaving a stray word', () => {
    const long = planSpeech(
      'Then my pick is Chance Eau Tendre Eau de Toilette. Grapefruit and quince over hyacinth and jasmine, softening into musk and iris. It opens on grapefruit and quince and settles into musk and iris.',
    );
    for (const cue of long.cues) {
      expect(cue.text.length).toBeLessThanOrEqual(64);
      expect(cue.text.split(' ').length).toBeGreaterThan(2);
    }
  });

  it('breaks subtitles at sentence ends', () => {
    expect(plan.cues.some((cue) => cue.text.endsWith('today?'))).toBe(true);
    expect(plan.cues.every((cue) => !/[.?!]\s\S/.test(cue.text) || cue.text.length <= 64)).toBe(
      true,
    );
  });

  it('plays cues back to back, ending with the speech', () => {
    plan.cues.forEach((cue, index) => {
      expect(cue.end).toBeGreaterThan(cue.start);
      if (index > 0) expect(cue.start).toBe(plan.cues[index - 1]!.end);
    });
    expect(plan.cues.at(-1)!.end).toBe(plan.duration);
  });

  it('speaks at a readable pace', () => {
    const words = greeting.split(/\s+/).length;
    const wordsPerMinute = words / (plan.duration / 60_000);
    expect(wordsPerMinute).toBeGreaterThan(130);
    expect(wordsPerMinute).toBeLessThan(200);
  });

  it('opens the mouth while speaking and closes it at pauses and the end', () => {
    const frames = new Set(plan.mouth.map((key) => key.frame));
    expect(frames.has(3)).toBe(true);
    expect(plan.mouth.at(-1)).toEqual({ at: plan.duration, frame: 0 });
    // Lips meet on "m" in "Perfume".
    expect(planSpeech('mm').mouth[0]?.frame).toBe(1);
    expect(planSpeech('ma').mouth[0]).toEqual({ at: 0, frame: 0 });
  });
});

describe('cueAt and mouthAt', () => {
  const plan = planSpeech('Hello there, welcome in. How are you finding the store today?');

  it('finds the cue on screen', () => {
    expect(cueAt(plan, 0)).toBe(0);
    expect(cueAt(plan, plan.cues[0]!.end)).toBe(1);
    expect(cueAt(plan, plan.duration + 1000)).toBe(plan.cues.length - 1);
  });

  it('is closed before and after speaking', () => {
    expect(mouthAt(plan, plan.duration + 10)).toBe(0);
    expect(mouthAt(plan, -1)).toBe(0);
  });
});

describe('shelve', () => {
  it('spreads bottles over three shelves', () => {
    expect(shelve([1, 2, 3]).map((shelf) => shelf.length)).toEqual([1, 1, 1]);
    expect(shelve([1, 2, 3, 4]).map((shelf) => shelf.length)).toEqual([1, 2, 1]);
    expect(shelve([1, 2, 3, 4, 5]).map((shelf) => shelf.length)).toEqual([2, 1, 2]);
    expect(shelve([1, 2]).map((shelf) => shelf.length)).toEqual([1, 0, 1]);
  });

  it('keeps every bottle, in order', () => {
    expect(shelve([1, 2, 3, 4, 5]).flat()).toEqual([1, 2, 3, 4, 5]);
  });
});
