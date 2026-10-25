'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { CloseIcon, MenuIcon } from '@/components/icons';
import styles from './MobileMenu.module.css';

type MobileMenuProps = {
  links: readonly { label: string; href: Route }[];
};

/** Keep in sync with the `(width < 960px)` breakpoint used across the CSS modules. */
const DESKTOP_QUERY = '(width >= 960px)';

/**
 * Full-screen menu for small viewports. Built on the native <dialog>, which
 * provides focus trapping, Escape-to-close and focus restoration for free.
 */
export function MobileMenu({ links }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) dialogRef.current?.close();
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={open}
      >
        <MenuIcon className={styles.toggleIcon} />
      </button>

      <dialog ref={dialogRef} className={styles.dialog} aria-label="Menu">
        <button type="button" className={styles.close} aria-label="Close menu" onClick={close}>
          <CloseIcon className={styles.closeIcon} />
        </button>
        <nav aria-label="Mobile">
          <ul className={styles.list}>
            {links.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className={styles.link} onClick={close}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </>
  );
}
