import { products } from '@/data/products';
import { countItems, resolveLines, subtotal } from '@/lib/cart';
import { useCartLines } from '@/lib/cart-store';

/** The bag joined with live catalogue prices. */
export function useBag() {
  const lines = useCartLines();
  const resolved = resolveLines(lines, products);
  return { lines: resolved, count: countItems(lines), subtotal: subtotal(resolved) };
}
