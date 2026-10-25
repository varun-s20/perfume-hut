'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { CloseIcon } from '@/components/icons';
import { routes } from '@/content/routes';
import { bagDrawer, useBagDrawerOpen } from '@/lib/cart-store';
import { BagLines } from './BagLines';
import { BagSummary } from './BagSummary';
import styles from './BagDrawer.module.css';
import { useBag } from './use-bag';

/**
 * Slide-over bag built on a modal <dialog>: focus trap, Escape and focus
 * restoration come from the platform; motion comes from CSS @starting-style.
 */
export function BagDrawer() {
  const open = useBagDrawerOpen();
  const { lines, count, subtotal } = useBag();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.drawer}
      aria-labelledby="bag-title"
      onClose={bagDrawer.close}
      onClick={(event) => {
        // A click on the dialog itself (not its panel) is a click on the backdrop.
        if (event.target === event.currentTarget) bagDrawer.close();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id="bag-title" className={styles.title}>
            Your bag <span className={styles.count}>({count})</span>
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label="Close bag"
            onClick={bagDrawer.close}
          >
            <CloseIcon />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className={styles.empty}>
            <p>Your bag is empty — the aisles are waiting.</p>
            <Link href={routes.shop} className={styles.emptyLink} onClick={bagDrawer.close}>
              Browse all fragrances
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.scroll}>
              <BagLines lines={lines} onNavigate={bagDrawer.close} />
            </div>
            <footer className={styles.footer}>
              <BagSummary subtotal={subtotal} onNavigate={bagDrawer.close} />
              <Link href={routes.bag} className={styles.viewBag} onClick={bagDrawer.close}>
                View full bag
              </Link>
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}
