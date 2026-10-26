'use client';

import Link from 'next/link';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { CheckIcon, CloseIcon } from '@/components/icons';
import { scentNotes, shop } from '@/content/shop';
import {
  type Audience,
  audienceLabels,
  audiences,
  families,
  familyLabels,
} from '@/lib/catalog-types';
import {
  activeCount,
  type Facets,
  facetCounts,
  matches,
  noFilters,
  priceBandLabels,
  priceBands,
  type ShopFilters,
  type Strength,
  strengthLabels,
  toggled,
} from '@/lib/shop';
import styles from './FilterSheet.module.css';
import { type ShopHouse, shopUrl } from './links';

type FilterSheetProps = {
  filters: ShopFilters;
  items: readonly Facets[];
  houses: readonly ShopHouse[];
  strengths: readonly Strength[];
  onClose: () => void;
  /** Called as the choices are applied. */
  onApply: () => void;
};

/** The sheet takes this long to leave (matches `sheet-out`). */
const CLOSE_MS = 240;

/**
 * Phones: every filter in a sheet that rises from the bottom. Choices are
 * staged here, each showing how many bottles it would leave, and the button
 * at the foot says exactly what you'll see before you go.
 */
export function FilterSheet({
  filters,
  items,
  houses,
  strengths,
  onClose,
  onApply,
}: FilterSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<ShopFilters>(filters);
  const [closing, setClosing] = useState(false);
  const counts = facetCounts(items, draft);
  const total = items.filter((item) => matches(item, draft)).length;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const close = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      dialogRef.current?.close();
      onClose();
    }, CLOSE_MS);
  };

  const set = (next: Partial<ShopFilters>) => setDraft((current) => ({ ...current, ...next }));
  const houseOrder = houses.map((house) => house.slug);
  const audienceOptions: (Audience | undefined)[] = [undefined, ...audiences];

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      data-closing={closing || undefined}
      aria-labelledby="filter-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.head}>
          <span className={styles.handle} aria-hidden="true" />
          <h2 id="filter-title" className={styles.title}>
            {shop.filter}
            {activeCount(draft) > 0 && (
              <span className={styles.titleCount}>{activeCount(draft)}</span>
            )}
          </h2>
          <button type="button" className={styles.close} onClick={close} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        <div className={styles.body}>
          <section className={styles.group}>
            <h3 className={styles.groupTitle}>{shop.groups.audience}</h3>
            <div
              className={styles.segments}
              style={
                {
                  '--count': audienceOptions.length,
                  '--index': audienceOptions.indexOf(draft.audience),
                } as CSSProperties
              }
            >
              <span className={styles.indicator} aria-hidden="true" />
              {audienceOptions.map((audience) => (
                <button
                  key={audience ?? 'all'}
                  type="button"
                  className={styles.segment}
                  aria-pressed={draft.audience === audience}
                  onClick={() => set({ audience })}
                >
                  {audience ? audienceLabels[audience] : shop.all}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.group}>
            <h3 className={styles.groupTitle}>{shop.groups.families}</h3>
            <ul className={styles.families}>
              {families.map((family) => {
                const on = draft.families.includes(family);
                const count = counts.families[family] ?? 0;
                return (
                  <li key={family}>
                    <button
                      type="button"
                      className={styles.family}
                      aria-pressed={on}
                      disabled={count === 0 && !on}
                      onClick={() => set({ families: toggled(draft.families, family, families) })}
                    >
                      <span className={styles.box} aria-hidden="true">
                        <CheckIcon />
                      </span>
                      <span className={styles.familyText}>
                        <span className={styles.familyName}>{familyLabels[family]}</span>
                        <span className={styles.familyNotes}>{scentNotes[family]}</span>
                      </span>
                      <span className={styles.familyCount}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={styles.group}>
            <h3 className={styles.groupTitle}>{shop.groups.brands}</h3>
            <ul className={styles.checks}>
              {houses.map((house) => {
                const on = draft.brands.includes(house.slug);
                const count = counts.brands[house.slug] ?? 0;
                return (
                  <li key={house.slug}>
                    <button
                      type="button"
                      className={styles.check}
                      aria-pressed={on}
                      disabled={count === 0 && !on}
                      onClick={() => set({ brands: toggled(draft.brands, house.slug, houseOrder) })}
                    >
                      <span className={styles.box} aria-hidden="true">
                        <CheckIcon />
                      </span>
                      <span className={styles.checkLabel}>{house.name}</span>
                      <span className={styles.checkCount}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={styles.group}>
            <h3 className={styles.groupTitle}>{shop.groups.prices}</h3>
            <ul className={styles.chips}>
              {priceBands.map((band) => {
                const on = draft.prices.includes(band);
                const count = counts.prices[band] ?? 0;
                return (
                  <li key={band}>
                    <button
                      type="button"
                      className={styles.chip}
                      aria-pressed={on}
                      disabled={count === 0 && !on}
                      onClick={() => set({ prices: toggled(draft.prices, band, priceBands) })}
                    >
                      {priceBandLabels[band]}
                      <span className={styles.chipCount}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={styles.group}>
            <h3 className={styles.groupTitle}>{shop.groups.strengths}</h3>
            <ul className={styles.chips}>
              {strengths.map((strength) => {
                const on = draft.strengths.includes(strength);
                const count = counts.strengths[strength] ?? 0;
                return (
                  <li key={strength}>
                    <button
                      type="button"
                      className={styles.chip}
                      aria-pressed={on}
                      disabled={count === 0 && !on}
                      onClick={() =>
                        set({ strengths: toggled(draft.strengths, strength, strengths) })
                      }
                    >
                      {strengthLabels[strength]}
                      <span className={styles.chipCount}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <footer className={styles.foot}>
          <button
            type="button"
            className={styles.reset}
            onClick={() => setDraft({ ...noFilters, sort: draft.sort })}
            disabled={activeCount(draft) === 0}
          >
            {shop.clear}
          </button>
          {total > 0 ? (
            <Link
              href={shopUrl(draft)}
              scroll={false}
              transitionTypes={['filter']}
              className={styles.apply}
              onClick={() => {
                onApply();
                close();
              }}
            >
              {shop.show(total)}
            </Link>
          ) : (
            <span className={styles.apply} aria-disabled="true">
              {shop.show(total)}
            </span>
          )}
        </footer>
      </div>
    </dialog>
  );
}
