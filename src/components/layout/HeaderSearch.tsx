'use client';

import type { Route } from 'next';
import Form from 'next/form';
import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { type KeyboardEvent, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRightIcon, CloseIcon, SearchIcon } from '@/components/icons';
import { routes } from '@/content/routes';
import { cx } from '@/lib/cx';
import { MAX_QUERY_LENGTH, matchesTerms, queryTerms } from '@/lib/search';
import styles from './HeaderSearch.module.css';

/** One bottle as the header search sees it; `text` comes from `searchText`. */
export type SearchEntry = {
  slug: string;
  href: Route;
  brand: string;
  name: string;
  concentration: string;
  price: string;
  image: StaticImageData;
  text: string;
};

type HeaderSearchProps = {
  entries: readonly SearchEntry[];
  suggestions: readonly string[];
  className?: string;
};

/** How many bottles the dropdown shows before "See all". */
const SHOWN = 5;

const searchHref = (query: string) => `${routes.search}?q=${encodeURIComponent(query)}` as Route;

/**
 * Search lives in the header: the icon grows into a field in place, and
 * results drop down beneath it as you type. Enter goes to the full results
 * page; Esc or a click elsewhere folds it back into the icon.
 */
export function HeaderSearch({ entries, suggestions, className }: HeaderSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const terms = queryTerms(query);
  const matches =
    terms.length > 0 ? entries.filter((entry) => matchesTerms(entry.text, terms)) : [];
  const shown = matches.slice(0, SHOWN);

  // The closed field is clipped to a circle over the icon, wherever the
  // layout puts it, so opening reads as the icon growing into the bar.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    const toggle = toggleRef.current;
    if (!field || !toggle) return;
    const measure = () => {
      const from = field.getBoundingClientRect();
      const icon = toggle.getBoundingClientRect();
      const size = from.height;
      const left = icon.left + icon.width / 2 - size / 2 - from.left;
      field.style.setProperty('--from-left', `${Math.max(0, left)}px`);
      field.style.setProperty('--from-right', `${Math.max(0, from.width - left - size)}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    toggleRef.current?.focus({ preventScroll: true });
  };

  // Leaving for a result: fold away and start fresh next time.
  const leave = () => {
    setOpen(false);
    setQuery('');
  };

  // Arrow keys move between the field and the results.
  const links = () => [...(listRef.current?.querySelectorAll<HTMLElement>('a') ?? [])];
  const onFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault();
    links()[0]?.focus();
  };
  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const all = links();
    const index = all.indexOf(document.activeElement as HTMLElement);
    const next = index + (event.key === 'ArrowDown' ? 1 : -1);
    if (next < 0) inputRef.current?.focus();
    else all[Math.min(next, all.length - 1)]?.focus();
  };

  const status =
    terms.length === 0
      ? ''
      : matches.length === 0
        ? `Nothing matches ${query}`
        : `${matches.length} ${matches.length === 1 ? 'result' : 'results'}`;

  return (
    <div ref={rootRef} className={cx(styles.search, className)} data-open={open}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-label="Search"
        aria-expanded={open}
        aria-controls={`${id}-field`}
        onClick={() => setOpen(true)}
      >
        <SearchIcon className={styles.toggleIcon} />
      </button>

      <div ref={fieldRef} id={`${id}-field`} className={styles.field} inert={!open}>
        <Form action={routes.search} role="search" className={styles.form} onSubmit={leave}>
          <SearchIcon className={styles.fieldIcon} />
          <label htmlFor={`${id}-input`} className="visually-hidden">
            Search fragrances
          </label>
          <input
            ref={inputRef}
            id={`${id}-input`}
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onFieldKeyDown}
            placeholder="Search a house, a bottle or a note"
            maxLength={MAX_QUERY_LENGTH}
            autoComplete="off"
            enterKeyHint="search"
            className={styles.input}
          />
          <button type="button" className={styles.dismiss} onClick={dismiss}>
            <CloseIcon className={styles.dismissIcon} />
            <span className="visually-hidden">Close search</span>
          </button>
        </Form>
      </div>

      <div ref={listRef} className={styles.panel} inert={!open} onKeyDown={onListKeyDown}>
        {terms.length === 0 ? (
          <>
            <p className={styles.heading}>Popular searches</p>
            <ul className={styles.chips}>
              {suggestions.map((term) => (
                <li key={term}>
                  <Link href={searchHref(term)} className={styles.chip} onClick={leave}>
                    {term}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : shown.length > 0 ? (
          <>
            <ul className={styles.results}>
              {shown.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={entry.href}
                    transitionTypes={['nav-forward']}
                    className={styles.result}
                    onClick={leave}
                  >
                    <span className={styles.thumb}>
                      <Image src={entry.image} alt="" sizes="64px" className={styles.thumbImage} />
                    </span>
                    <span className={styles.label}>
                      <span className={styles.brand}>{entry.brand}</span>
                      <span className={styles.name}>
                        {entry.name}
                        <span className={styles.concentration}>{entry.concentration}</span>
                      </span>
                    </span>
                    <span className={styles.price}>{entry.price}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={searchHref(query)} className={styles.all} onClick={leave}>
              {matches.length > SHOWN
                ? `See all ${matches.length} results`
                : 'Open the results page'}
              <ArrowRightIcon className={styles.allArrow} />
            </Link>
          </>
        ) : (
          <p className={styles.empty}>
            Nothing matches “{query.trim()}” yet. Try a note like “vanilla” or a house like “Dior”.
          </p>
        )}
        <p className="visually-hidden" aria-live="polite">
          {open ? status : ''}
        </p>
      </div>
    </div>
  );
}
