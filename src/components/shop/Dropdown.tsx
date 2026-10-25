'use client';

import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import { cx } from '@/lib/cx';
import styles from './Dropdown.module.css';

type DropdownProps = {
  label: string;
  /** What's chosen, shown on the button (a count, or the sort's name). */
  summary?: string;
  /** The button looks chosen when something in it is. */
  active?: boolean;
  align?: 'start' | 'end';
  children: ReactNode;
};

/**
 * A toolbar button with a panel beneath it. It stays open while you tick
 * several options (each one is a link, so the shelf updates as you go) and
 * closes on Esc or a click elsewhere.
 */
export function Dropdown({ label, summary, active, align = 'start', children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={styles.dropdown} data-open={open || undefined}>
      <button
        ref={buttonRef}
        type="button"
        className={cx(styles.trigger, active && styles.triggerActive)}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        {summary && <span className={styles.summary}>{summary}</span>}
        <ChevronDownIcon className={styles.chevron} />
      </button>
      <div id={id} className={cx(styles.panel, align === 'end' && styles.end)} inert={!open}>
        {children}
      </div>
    </div>
  );
}
