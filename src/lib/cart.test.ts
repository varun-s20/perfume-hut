import { describe, expect, it } from 'vitest';
import { products } from '@/data/products';
import {
  type CartLine,
  cartReducer,
  countItems,
  MAX_QUANTITY,
  parseStoredLines,
  resolveLines,
  subtotal,
} from './cart';

const [first, second] = products;
const line = (overrides: Partial<CartLine> = {}): CartLine => ({
  slug: first!.slug,
  ml: first!.sizes[0].ml,
  quantity: 1,
  ...overrides,
});

describe('cartReducer', () => {
  it('adds a new line, then increments the same product and size', () => {
    let lines = cartReducer([], { type: 'add', slug: 'a', ml: 50 });
    lines = cartReducer(lines, { type: 'add', slug: 'a', ml: 50, quantity: 2 });
    expect(lines).toEqual([{ slug: 'a', ml: 50, quantity: 3 }]);
  });

  it('keeps different sizes of the same product as separate lines', () => {
    let lines = cartReducer([], { type: 'add', slug: 'a', ml: 50 });
    lines = cartReducer(lines, { type: 'add', slug: 'a', ml: 100 });
    expect(lines).toHaveLength(2);
  });

  it('caps quantities and removes a line when set to zero', () => {
    let lines = cartReducer([], { type: 'add', slug: 'a', ml: 50, quantity: 99 });
    expect(lines[0]?.quantity).toBe(MAX_QUANTITY);
    lines = cartReducer(lines, { type: 'setQuantity', slug: 'a', ml: 50, quantity: 0 });
    expect(lines).toEqual([]);
  });

  it('does not mutate the previous state', () => {
    const before: readonly CartLine[] = [{ slug: 'a', ml: 50, quantity: 1 }];
    cartReducer(before, { type: 'add', slug: 'a', ml: 50 });
    expect(before[0]?.quantity).toBe(1);
  });
});

describe('resolveLines', () => {
  it('prices lines from the catalogue and drops unknown products or sizes', () => {
    const resolved = resolveLines(
      [
        line({ quantity: 2 }),
        line({ slug: 'discontinued' }),
        line({ slug: second!.slug, ml: 999 }),
      ],
      products,
    );
    expect(resolved).toHaveLength(1);
    expect(resolved[0]?.lineTotal.amount).toBe(first!.sizes[0].price.amount * 2);
    expect(subtotal(resolved).amount).toBe(first!.sizes[0].price.amount * 2);
  });
});

describe('countItems', () => {
  it('sums quantities across lines', () => {
    expect(countItems([line({ quantity: 2 }), line({ ml: 100, quantity: 3 })])).toBe(5);
  });
});

describe('parseStoredLines', () => {
  it('rejects malformed storage and clamps quantities', () => {
    expect(parseStoredLines('nope')).toEqual([]);
    expect(
      parseStoredLines([
        { slug: 'a', ml: 50, quantity: 2 },
        { slug: 'b', ml: '50', quantity: 1 },
        null,
        { slug: 'c', ml: 50, quantity: 500 },
        { slug: 'd', ml: 50, quantity: -1 },
      ]),
    ).toEqual([
      { slug: 'a', ml: 50, quantity: 2 },
      { slug: 'c', ml: 50, quantity: MAX_QUANTITY },
    ]);
  });
});
