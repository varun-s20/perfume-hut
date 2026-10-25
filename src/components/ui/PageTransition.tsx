import { type ReactNode, ViewTransition } from 'react';

/**
 * Page-level view transition keyed by navigation type:
 * - `nav-forward` / `nav-back`: hierarchical moves (shop → product and back)
 * - `walk-in`: stepping from the store floor into an aisle
 * Untyped navigations don't animate the page, so shared-element morphs stand alone.
 */
const byType = {
  'nav-forward': 'nav-forward',
  'nav-back': 'nav-back',
  'walk-in': 'walk-in',
  default: 'none',
} as const;

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="none" enter={byType} exit={byType}>
      <div>{children}</div>
    </ViewTransition>
  );
}
