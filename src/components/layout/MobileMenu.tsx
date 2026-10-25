'use client';

import type { Route } from 'next';
import Form from 'next/form';
import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { ArrowRightIcon, BagIcon, CloseIcon, MenuIcon, SearchIcon } from '@/components/icons';
import { menu } from '@/content/menu';
import { routes } from '@/content/routes';
import { countItems } from '@/lib/cart';
import { bagDrawer, useCartLines } from '@/lib/cart-store';
import { MAX_QUERY_LENGTH } from '@/lib/search';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import styles from './MobileMenu.module.css';

export type MenuHouse = {
  slug: string;
  name: string;
  href: Route;
  aisle: number;
  image: StaticImageData;
  imagePosition: string;
};

type MobileMenuProps = {
  houses: readonly MenuHouse[];
};

/** Keep in sync with the `(width < 960px)` breakpoint used across the CSS modules. */
const DESKTOP_QUERY = '(width >= 960px)';
/** The sheet takes this long to leave (matches `menu-out` in the CSS). */
const CLOSE_MS = 220;

const stagger = (index: number) => ({ '--i': index }) as CSSProperties;

/**
 * The phone menu: a cream sheet that drops over the page. Its top bar sits
 * exactly where the header's does, so the menu button becomes the close
 * button in place. Then search, the main rooms of the store, ways in to the
 * shelves and the aisles themselves, each in its arched doorway. Built on
 * the native <dialog> (focus trap, Esc, focus restored); leaving animates.
 */
export function MobileMenu({ houses }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const reduced = usePrefersReducedMotion();
  const count = countItems(useCartLines());

  const open = () => dialogRef.current?.showModal();

  const close = (then?: () => void) => {
    const dialog = dialogRef.current;
    if (!dialog?.open || closing) return;
    if (reduced) {
      dialog.close();
      then?.();
      return;
    }
    setClosing(true);
    window.setTimeout(() => {
      dialog.close();
      setClosing(false);
      then?.();
    }, CLOSE_MS);
  };

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) dialogRef.current?.close();
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  // The order things arrive in, top to bottom.
  const later = menu.primary.length + 1;

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

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        data-closing={closing || undefined}
        aria-label={menu.label}
        onCancel={(event) => {
          // Esc: leave the same way the close button does.
          event.preventDefault();
          close();
        }}
      >
        <div className={styles.bar}>
          <button
            type="button"
            className={styles.barButton}
            aria-label="Close menu"
            onClick={() => close()}
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
          <Link href={routes.home} className={styles.logo} onClick={() => close()}>
            PH<span className="visually-hidden"> Perfume Hut home</span>
          </Link>
          <button
            type="button"
            className={styles.barButton}
            aria-label={
              count > 0 ? `Bag, ${count} ${count === 1 ? 'item' : 'items'}` : 'Bag, empty'
            }
            onClick={() => close(bagDrawer.open)}
          >
            <BagIcon className={styles.bagIcon} />
            {count > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {count}
              </span>
            )}
          </button>
        </div>

        <div className={styles.body}>
          <Form
            action={routes.search}
            role="search"
            className={styles.search}
            style={stagger(0)}
            onSubmit={() => close()}
          >
            <SearchIcon className={styles.searchIcon} />
            <label htmlFor="menu-search" className="visually-hidden">
              Search fragrances
            </label>
            <input
              id="menu-search"
              name="q"
              type="search"
              placeholder={menu.search}
              maxLength={MAX_QUERY_LENGTH}
              autoComplete="off"
              enterKeyHint="search"
              className={styles.searchInput}
            />
          </Form>

          <nav aria-label="Mobile">
            <ol className={styles.primary}>
              {menu.primary.map((link, index) => (
                <li key={link.label} style={stagger(index + 1)}>
                  <Link href={link.href} className={styles.primaryLink} onClick={() => close()}>
                    <span className={styles.primaryIndex}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.primaryLabel}>{link.label}</span>
                    <ArrowRightIcon className={styles.primaryArrow} />
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <section className={styles.group} style={stagger(later)} aria-labelledby="menu-shop-by">
            <h2 id="menu-shop-by" className={styles.groupTitle}>
              {menu.shopBy.title}
            </h2>
            <ul className={styles.chips}>
              {menu.shopBy.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.chip} onClick={() => close()}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={styles.group}
            style={stagger(later + 1)}
            aria-labelledby="menu-aisles"
          >
            <div className={styles.groupHead}>
              <h2 id="menu-aisles" className={styles.groupTitle}>
                {menu.aisles.title}
              </h2>
              <Link href={routes.brands} className={styles.groupLink} onClick={() => close()}>
                {menu.aisles.all}
                <ArrowRightIcon className={styles.groupArrow} />
              </Link>
            </div>
            <ul className={styles.aisles}>
              {houses.map((house) => (
                <li key={house.slug}>
                  <Link
                    href={house.href}
                    transitionTypes={['walk-in']}
                    className={styles.aisle}
                    onClick={() => close()}
                  >
                    <span className={styles.arch}>
                      <Image
                        src={house.image}
                        alt=""
                        sizes="110px"
                        className={styles.archImage}
                        style={{ objectPosition: house.imagePosition }}
                      />
                    </span>
                    <span className={styles.aisleNumber}>{menu.aisles.number(house.aisle)}</span>
                    <span className={styles.aisleName}>{house.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className={styles.foot} style={stagger(later + 2)}>
            <p className={styles.live}>
              <span className={styles.liveDot} aria-hidden="true" />
              <span>
                <span className={styles.liveTitle}>{menu.live.title}</span>
                <span className={styles.liveText}>{menu.live.text}</span>
              </span>
            </p>
            <ul className={styles.help}>
              {menu.help.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.helpLink} onClick={() => close()}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </dialog>
    </>
  );
}
