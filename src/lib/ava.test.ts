import { describe, expect, it } from 'vitest';
import {
  type CabinetProduct,
  firstSentence,
  moodChoices,
  recommend,
  speakNotes,
  whoChoices,
} from './ava';

const bottle = (overrides: Partial<CabinetProduct>): CabinetProduct => ({
  slug: 'bottle',
  name: 'Bottle',
  concentration: 'Eau de Parfum',
  audience: 'unisex',
  family: 'woody',
  description: 'A test bottle.',
  top: ['Bergamot'],
  base: ['Cedar'],
  bestseller: false,
  ...overrides,
});

const cabinet = [
  bottle({ slug: 'fresh-him', audience: 'him', family: 'fresh' }),
  bottle({ slug: 'amber-him', audience: 'him', family: 'amber', bestseller: true }),
  bottle({ slug: 'floral-her', audience: 'her', family: 'floral' }),
];

describe('whoChoices', () => {
  it('offers only the people the shelves cater for, plus anyone', () => {
    expect(whoChoices(cabinet)).toEqual(['him', 'her', 'anyone']);
    expect(whoChoices([bottle({ audience: 'him' })])).toEqual(['him', 'anyone']);
  });

  it('treats unisex bottles as suiting everyone', () => {
    expect(whoChoices([bottle({ audience: 'unisex' })])).toEqual(['him', 'her', 'anyone']);
  });
});

describe('moodChoices', () => {
  it('lists families that suit the person, in catalogue order', () => {
    expect(moodChoices(cabinet, 'him')).toEqual(['fresh', 'amber']);
    expect(moodChoices(cabinet, 'anyone')).toEqual(['fresh', 'floral', 'amber']);
  });
});

describe('recommend', () => {
  it('prefers an exact match', () => {
    expect(recommend(cabinet, 'him', 'fresh')).toEqual({ product: cabinet[0], exact: true });
  });

  it('prefers a bestseller when several fit', () => {
    expect(recommend(cabinet, 'him')?.product.slug).toBe('amber-him');
  });

  it('widens the search when nothing matches exactly', () => {
    expect(recommend(cabinet, 'her', 'amber')).toEqual({ product: cabinet[2], exact: false });
  });

  it('returns nothing for an empty cabinet', () => {
    expect(recommend([], 'anyone')).toBeUndefined();
  });
});

describe('copy helpers', () => {
  it('takes the first sentence', () => {
    expect(firstSentence('Fresh and bright. Then warm.')).toBe('Fresh and bright.');
    expect(firstSentence('No full stop')).toBe('No full stop');
  });

  it('speaks notes naturally', () => {
    expect(speakNotes(['Bergamot', 'Pink pepper', 'Lavender'])).toBe('bergamot and pink pepper');
    expect(speakNotes(['Bergamot', 'Pink pepper', 'Lavender'], 3)).toBe(
      'bergamot, pink pepper and lavender',
    );
    expect(speakNotes(['Vanilla'])).toBe('vanilla');
  });
});
