'use client';

import { type ReactNode, useId, useState } from 'react';
import { cx } from '@/lib/cx';
import styles from './Accordion.module.css';

export type AccordionItem = { id: string; title: ReactNode; content: ReactNode };

type AccordionProps = {
  items: readonly AccordionItem[];
  /** Ids open on first render. */
  defaultOpen?: readonly string[];
  className?: string;
};

/**
 * Disclosure list. Height animates with the grid-rows 0fr → 1fr technique, so
 * content keeps its natural height and the transition stays interruptible.
 */
export function Accordion({ items, defaultOpen = [], className }: AccordionProps) {
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set(defaultOpen));
  const baseId = useId();

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={cx(styles.accordion, className)}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const panelId = `${baseId}-${item.id}`;
        return (
          <div key={item.id} className={styles.item} data-open={isOpen}>
            <h3 className={styles.heading}>
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                <span>{item.title}</span>
                <span className={styles.icon} aria-hidden="true" />
              </button>
            </h3>
            <div id={panelId} className={styles.panel} inert={!isOpen}>
              <div className={styles.inner}>
                <div className={styles.content}>{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
