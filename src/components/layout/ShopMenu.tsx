'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import { cx } from '@/lib/cx';
import styles from './ShopMenu.module.css';

type MenuLink = { label: string; href: Route };

type ShopMenuProps = {
  triggerClassName?: string;
  collections: readonly MenuLink[];
  brands: readonly MenuLink[];
};

/**
 * Click-to-open dropdown. It scales in from its trigger (origin-aware) and,
 * being driven by CSS transitions, can be interrupted mid-animation.
 */
export function ShopMenu({ triggerClassName, collections, brands }: ShopMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        rootRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={triggerClassName}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        Shop
        <ChevronDownIcon className={cx(styles.chevron, open && styles.chevronOpen)} />
      </button>

      <div id={panelId} className={styles.panel} data-open={open} inert={!open}>
        <div className={styles.column}>
          <p className={styles.heading}>Collections</p>
          <ul>
            {collections.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link} onClick={close}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.column}>
          <p className={styles.heading}>Aisles</p>
          <ul className={styles.brandList}>
            {brands.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link} onClick={close}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
