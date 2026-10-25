import { describe, expect, it } from 'vitest';
import { formatMoney, toDecimalString } from './money';

describe('formatMoney', () => {
  it('drops the fraction for whole amounts', () => {
    expect(formatMoney({ amount: 5500, currency: 'USD' })).toBe('$55');
  });

  it('keeps cents when present', () => {
    expect(formatMoney({ amount: 5599, currency: 'USD' })).toBe('$55.99');
  });

  it('pads single-digit cents', () => {
    expect(formatMoney({ amount: 5505, currency: 'USD' })).toBe('$55.05');
  });
});

describe('toDecimalString', () => {
  it('always renders two decimals', () => {
    expect(toDecimalString({ amount: 5500, currency: 'USD' })).toBe('55.00');
    expect(toDecimalString({ amount: 5599, currency: 'USD' })).toBe('55.99');
  });
});
