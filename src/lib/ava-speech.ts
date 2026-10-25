/**
 * Timing for Ava's speech: subtitle cues and a mouth (viseme) track, planned
 * from the text alone. A voiced avatar can replace this later with timings
 * from its own audio; the cue and mouth shapes stay the same.
 */

/** 0 closed · 1 parted · 2 open · 3 wide ("ah"). Matches the mouth sprite. */
export type MouthFrame = 0 | 1 | 2 | 3;

export type Cue = { start: number; end: number; text: string };
export type MouthKey = { at: number; frame: MouthFrame };
export type SpeechPlan = { cues: Cue[]; mouth: MouthKey[]; duration: number };

type Options = {
  /** Time per syllable; ~210ms keeps subtitles at a comfortable ~165 words a minute. */
  syllableMs?: number;
  /** Longest subtitle, in characters: two short lines. */
  maxCueChars?: number;
};

const SENTENCE_PAUSE = 380;
const CLAUSE_PAUSE = 200;
const WORD_GAP = 40;

const VOWEL_GROUP = /[aeiouyàâäéèêëîïôöùûüœæ]+/gi;

function vowelFrame(group: string): MouthFrame {
  const v = group[0]!.toLowerCase();
  if ('aoàâäôöæœ'.includes(v)) return 3;
  if ('eiéèêëîï'.includes(v)) return 2;
  return 1; // u, y: rounded and small
}

function onsetFrame(onset: string): MouthFrame {
  // Lips meet for m, b and p; everything else starts slightly parted.
  return /[mbp]$/i.test(onset) ? 0 : 1;
}

function pauseAfter(word: string): number {
  if (/[.!?…]["”’)]*$/.test(word)) return SENTENCE_PAUSE;
  if (/[,;:]["”’)]*$/.test(word) || /^[—–-]$/.test(word)) return CLAUSE_PAUSE;
  return WORD_GAP;
}

/**
 * Where subtitles end (word indices). Sentences end them (very short ones join
 * the next); a long sentence is split into evenly sized parts, preferring to
 * break after a comma or dash, so no subtitle is left with a stray word or two.
 */
function cueBreaks(words: readonly string[], maxChars: number): Set<number> {
  const breaks = new Set<number>();
  let start = 0;
  words.forEach((word, end) => {
    const last = end === words.length - 1;
    if (pauseAfter(word) !== SENTENCE_PAUSE && !last) return;
    const sentence = words.slice(start, end + 1);
    const length = sentence.join(' ').length;
    // A very short sentence ("Versace.") shares a subtitle with the next one.
    if (length < 16 && !last) return;
    // When it must split, leave slack below the limit: breaks land on word boundaries.
    const parts = length <= maxChars ? 1 : Math.ceil(length / Math.max(maxChars - 12, 12));
    let cumulative = 0;
    const ends = sentence.map((w, i) => (cumulative += w.length + (i > 0 ? 1 : 0)));
    let from = 0;
    for (let k = 1; k < parts; k++) {
      const target = (length * k) / parts;
      let best = -1;
      let bestScore = Infinity;
      for (let i = from; i < sentence.length - 1; i++) {
        const clause =
          pauseAfter(sentence[i]!) === CLAUSE_PAUSE || /^[—–-]$/.test(sentence[i + 1]!);
        const score = Math.abs(ends[i]! - target) - (clause ? 10 : 0);
        if (score < bestScore) {
          bestScore = score;
          best = i;
        }
      }
      if (best >= 0) {
        breaks.add(start + best);
        from = best + 1;
      }
    }
    breaks.add(end);
    start = end + 1;
  });
  return breaks;
}

export function planSpeech(text: string, options: Options = {}): SpeechPlan {
  const { syllableMs = 210, maxCueChars = 64 } = options;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const breaks = cueBreaks(words, maxCueChars);
  const mouth: MouthKey[] = [];
  const cues: Cue[] = [];
  let t = 0;
  let cue: { start: number; words: string[] } | null = null;

  const closeCue = (end: number) => {
    if (cue) cues.push({ start: cue.start, end, text: cue.words.join(' ') });
    cue = null;
  };

  for (const [index, word] of words.entries()) {
    cue ??= { start: t, words: [] };
    cue.words.push(word);

    // Syllables: each vowel group is one; the consonants before it are its onset.
    const letters = word.replace(/[^\p{L}']/gu, '');
    const groups = [...letters.matchAll(VOWEL_GROUP)];
    if (groups.length === 0 && letters.length > 0) {
      mouth.push({ at: t, frame: 1 });
      t += syllableMs;
    }
    let previousEnd = 0;
    for (const group of groups) {
      const onset = letters.slice(previousEnd, group.index);
      mouth.push({ at: t, frame: onsetFrame(onset) });
      mouth.push({ at: t + syllableMs * 0.35, frame: vowelFrame(group[0]) });
      t += syllableMs;
      previousEnd = group.index + group[0].length;
    }

    const pause = pauseAfter(word);
    mouth.push({ at: t, frame: pause > WORD_GAP ? 0 : 1 });
    t += pause;

    if (breaks.has(index)) closeCue(t);
  }
  closeCue(t);
  mouth.push({ at: t, frame: 0 });

  return { cues, mouth, duration: t };
}

/** The cue showing at time `t`; the last one stays up once speech has finished. */
export function cueAt(plan: SpeechPlan, t: number): number {
  const index = plan.cues.findIndex((cue) => t < cue.end);
  return index === -1 ? plan.cues.length - 1 : index;
}

/** The mouth shape at time `t`. */
export function mouthAt(plan: SpeechPlan, t: number): MouthFrame {
  let frame: MouthFrame = 0;
  for (const key of plan.mouth) {
    if (key.at > t) break;
    frame = key.frame;
  }
  return frame;
}

/** Spread bottles over a cabinet's three shelves, extras going to the outer ones. */
export function shelve<T>(items: readonly T[], shelves = 3): T[][] {
  const base = Math.floor(items.length / shelves);
  const extra = items.length % shelves;
  // With one extra it sits in the middle; with two, top and bottom.
  const counts = Array.from({ length: shelves }, (_, i) => {
    if (extra === 1) return base + (i === Math.floor(shelves / 2) ? 1 : 0);
    if (extra === 2) return base + (i === 0 || i === shelves - 1 ? 1 : 0);
    return base + (i < extra ? 1 : 0);
  });
  const result: T[][] = [];
  let index = 0;
  for (const count of counts) {
    result.push(items.slice(index, index + count));
    index += count;
  }
  return result;
}
