import type { Product } from './catalog-types';
import type { Money } from './money';

export const MAX_QUANTITY = 10;

export type CartLine = {
  slug: string;
  ml: number;
  quantity: number;
};

export type CartAction =
  | { type: 'add'; slug: string; ml: number; quantity?: number }
  | { type: 'setQuantity'; slug: string; ml: number; quantity: number }
  | { type: 'remove'; slug: string; ml: number }
  | { type: 'replace'; lines: readonly CartLine[] }
  | { type: 'clear' };

const sameLine = (line: CartLine, slug: string, ml: number) => line.slug === slug && line.ml === ml;

const clampQuantity = (quantity: number) =>
  Math.min(MAX_QUANTITY, Math.max(0, Math.floor(quantity)));

export function cartReducer(lines: readonly CartLine[], action: CartAction): readonly CartLine[] {
  switch (action.type) {
    case 'add': {
      const amount = action.quantity ?? 1;
      const existing = lines.find((line) => sameLine(line, action.slug, action.ml));
      if (!existing) {
        return [...lines, { slug: action.slug, ml: action.ml, quantity: clampQuantity(amount) }];
      }
      return lines.map((line) =>
        line === existing ? { ...line, quantity: clampQuantity(line.quantity + amount) } : line,
      );
    }
    case 'setQuantity': {
      const quantity = clampQuantity(action.quantity);
      if (quantity === 0) return lines.filter((line) => !sameLine(line, action.slug, action.ml));
      return lines.map((line) =>
        sameLine(line, action.slug, action.ml) ? { ...line, quantity } : line,
      );
    }
    case 'remove':
      return lines.filter((line) => !sameLine(line, action.slug, action.ml));
    case 'replace':
      return action.lines;
    case 'clear':
      return [];
  }
}

export type ResolvedLine = CartLine & {
  product: Product;
  unitPrice: Money;
  lineTotal: Money;
};

/**
 * Joins stored lines with the catalogue. Lines whose product or size no longer
 * exists are dropped, so a stale bag can never show a phantom item or price.
 */
export function resolveLines(
  lines: readonly CartLine[],
  products: readonly Product[],
): ResolvedLine[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return lines.flatMap((line) => {
    const product = bySlug.get(line.slug);
    const size = product?.sizes.find((candidate) => candidate.ml === line.ml);
    if (!product || !size) return [];
    return [
      {
        ...line,
        product,
        unitPrice: size.price,
        lineTotal: { amount: size.price.amount * line.quantity, currency: size.price.currency },
      },
    ];
  });
}

export function countItems(lines: readonly CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function subtotal(lines: readonly ResolvedLine[]): Money {
  return {
    amount: lines.reduce((total, line) => total + line.lineTotal.amount, 0),
    currency: 'USD',
  };
}

/** Validates persisted data before trusting it (localStorage is user-editable). */
export function parseStoredLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry): CartLine[] => {
    if (typeof entry !== 'object' || entry === null) return [];
    const { slug, ml, quantity } = entry as Record<string, unknown>;
    if (typeof slug !== 'string' || typeof ml !== 'number' || typeof quantity !== 'number') {
      return [];
    }
    const clamped = clampQuantity(quantity);
    return clamped > 0 ? [{ slug, ml, quantity: clamped }] : [];
  });
}
