'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { CheckIcon, CloseIcon, FilterIcon, SortIcon } from '@/components/icons';
import { familySwatches, shop } from '@/content/shop';
import {
  type Audience,
  audienceLabels,
  audiences,
  families,
  familyLabels,
  type Family,
} from '@/lib/catalog-types';
import { cx } from '@/lib/cx';
import {
  activeCount,
  type Facets,
  facetCounts,
  noFilters,
  priceBandLabels,
  priceBands,
  type ShopFilters,
  sortLabels,
  sortOptions,
  type Strength,
  strengthLabels,
  toggled,
} from '@/lib/shop';
import { Dropdown } from './Dropdown';
import { FilterSheet } from './FilterSheet';
import { type ShopHouse, shopUrl } from './links';
import styles from './ShopControls.module.css';

type ShopControlsProps = {
  filters: ShopFilters;
  /** Every bottle's facets, so counts (and the phone sheet's preview) work in the browser. */
  items: readonly Facets[];
  houses: readonly ShopHouse[];
  /** The strengths there's anything in. */
  strengths: readonly Strength[];
  resultCount: number;
  /** The results grid. */
  children: ReactNode;
};

/** Every filter link updates the shelf in place, with the grid's filter transition. */
const linkProps = { scroll: false, transitionTypes: ['filter'] };

/**
 * The shop's filters, built around how people choose fragrance: by scent
 * first (the families, as swatches of colour), then who it's for, the house,
 * price and strength. Every option says how many bottles it leaves you with.
 * On a wide screen they sit in a toolbar that sticks above the grid; on a
 * phone, the families stay in a row you swipe and the rest open in a sheet
 * from a pill that floats within thumb's reach.
 */
export function ShopControls({
  filters,
  items,
  houses,
  strengths,
  resultCount,
  children,
}: ShopControlsProps) {
  const counts = facetCounts(items, filters);
  const active = activeCount(filters);
  const resultsRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [inResults, setInResults] = useState(false);
  const [sheet, setSheet] = useState<'filter' | 'sort' | null>(null);

  // The phone's filter pill floats only while you're among the results.
  useEffect(() => {
    const results = resultsRef.current;
    if (!results) return;
    const observer = new IntersectionObserver(([entry]) =>
      setInResults(Boolean(entry?.isIntersecting)),
    );
    observer.observe(results);
    return () => observer.disconnect();
  }, []);

  const houseName = new Map(houses.map((house) => [house.slug, house.name]));
  const chips: { label: string; href: Route; family?: Family }[] = [
    ...filters.families.map((value) => ({
      label: familyLabels[value],
      href: shopUrl({ ...filters, families: filters.families.filter((v) => v !== value) }),
      family: value,
    })),
    ...(filters.audience
      ? [
          {
            label: audienceLabels[filters.audience],
            href: shopUrl({ ...filters, audience: undefined }),
          },
        ]
      : []),
    ...filters.brands.map((value) => ({
      label: houseName.get(value) ?? value,
      href: shopUrl({ ...filters, brands: filters.brands.filter((v) => v !== value) }),
    })),
    ...filters.prices.map((value) => ({
      label: priceBandLabels[value],
      href: shopUrl({ ...filters, prices: filters.prices.filter((v) => v !== value) }),
    })),
    ...filters.strengths.map((value) => ({
      label: strengthLabels[value],
      href: shopUrl({ ...filters, strengths: filters.strengths.filter((v) => v !== value) }),
    })),
  ];

  return (
    <>
      {/* ---------- The toolbar ---------- */}
      <div ref={toolbarRef} className={styles.toolbar}>
        <AudienceSwitch filters={filters} />

        <div className={styles.dropdowns}>
          <Dropdown
            label={shop.groups.families}
            summary={filters.families.length ? String(filters.families.length) : undefined}
            active={filters.families.length > 0}
          >
            <ul className={styles.familyOptionList}>
              {families.map((family) => (
                <li key={family}>
                  <FamilyOptionLink
                    href={shopUrl({
                      ...filters,
                      families: toggled(filters.families, family, families),
                    })}
                    active={filters.families.includes(family)}
                    family={family}
                    count={counts.families[family] ?? 0}
                  />
                </li>
              ))}
            </ul>
          </Dropdown>

          <Dropdown
            label={shop.groups.brands}
            summary={filters.brands.length ? String(filters.brands.length) : undefined}
            active={filters.brands.length > 0}
          >
            <ul className={styles.optionList} data-columns="2">
              {houses.map((house) => (
                <li key={house.slug}>
                  <OptionLink
                    href={shopUrl({
                      ...filters,
                      brands: toggled(
                        filters.brands,
                        house.slug,
                        houses.map((h) => h.slug),
                      ),
                    })}
                    active={filters.brands.includes(house.slug)}
                    label={house.name}
                    count={counts.brands[house.slug] ?? 0}
                  />
                </li>
              ))}
            </ul>
          </Dropdown>

          <Dropdown
            label={shop.groups.prices}
            summary={filters.prices.length ? String(filters.prices.length) : undefined}
            active={filters.prices.length > 0}
          >
            <ul className={styles.optionList}>
              {priceBands.map((band) => (
                <li key={band}>
                  <OptionLink
                    href={shopUrl({
                      ...filters,
                      prices: toggled(filters.prices, band, priceBands),
                    })}
                    active={filters.prices.includes(band)}
                    label={priceBandLabels[band]}
                    count={counts.prices[band] ?? 0}
                  />
                </li>
              ))}
            </ul>
          </Dropdown>

          <Dropdown
            label={shop.groups.strengths}
            summary={filters.strengths.length ? String(filters.strengths.length) : undefined}
            active={filters.strengths.length > 0}
          >
            <ul className={styles.optionList}>
              {strengths.map((strength) => (
                <li key={strength}>
                  <OptionLink
                    href={shopUrl({
                      ...filters,
                      strengths: toggled(filters.strengths, strength, strengths),
                    })}
                    active={filters.strengths.includes(strength)}
                    label={strengthLabels[strength]}
                    count={counts.strengths[strength] ?? 0}
                  />
                </li>
              ))}
            </ul>
          </Dropdown>
        </div>

        <p className={styles.count} aria-live="polite">
          {shop.results(resultCount)}
        </p>

        <div className={styles.sort}>
          <Dropdown label={shop.sort} summary={sortLabels[filters.sort]} align="end">
            <ul className={styles.optionList}>
              {sortOptions.map((option) => (
                <li key={option}>
                  <Link
                    href={shopUrl({ ...filters, sort: option })}
                    {...linkProps}
                    className={styles.option}
                    aria-current={filters.sort === option ? 'true' : undefined}
                  >
                    <span className={styles.radio} aria-hidden="true" />
                    <span className={styles.optionLabel}>{sortLabels[option]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Dropdown>
        </div>
      </div>

      {/* ---------- What's on, each removable ---------- */}
      {chips.length > 0 && (
        <ul className={styles.chips} aria-label="Active filters">
          {chips.map((chip) => (
            <li key={chip.label}>
              <Link
                href={chip.href}
                {...linkProps}
                className={styles.chip}
                aria-label={shop.remove(chip.label)}
              >
                {chip.family && (
                  <span
                    className={styles.chipPip}
                    style={
                      {
                        '--from': familySwatches[chip.family].colours[0],
                        '--to': familySwatches[chip.family].colours[1],
                      } as CSSProperties
                    }
                    aria-hidden="true"
                  />
                )}
                {chip.label}
                <CloseIcon className={styles.chipIcon} />
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={shopUrl({ ...noFilters, sort: filters.sort })}
              {...linkProps}
              className={styles.clear}
            >
              {shop.clear}
            </Link>
          </li>
        </ul>
      )}

      <div ref={resultsRef} className={styles.results}>
        {children}
      </div>

      {/* ---------- Phones: filter and sort, within thumb's reach ---------- */}
      <div className={styles.pill} data-shown={(inResults && sheet === null) || undefined}>
        <button type="button" className={styles.pillButton} onClick={() => setSheet('filter')}>
          <FilterIcon className={styles.pillIcon} />
          {shop.filter}
          {active > 0 && <span className={styles.pillCount}>{active}</span>}
        </button>
        <span className={styles.pillRule} aria-hidden="true" />
        <button type="button" className={styles.pillButton} onClick={() => setSheet('sort')}>
          <SortIcon className={styles.pillIcon} />
          {shop.sort}
        </button>
      </div>

      {sheet === 'filter' && (
        <FilterSheet
          filters={filters}
          items={items}
          houses={houses}
          strengths={strengths}
          onClose={() => setSheet(null)}
          onApply={() => {
            // Back to the top of the results if you'd scrolled past them; the list may be shorter now.
            const toolbar = toolbarRef.current;
            if (toolbar && toolbar.getBoundingClientRect().top < 0)
              toolbar.scrollIntoView({ block: 'start' });
          }}
        />
      )}
      {sheet === 'sort' && <SortSheet filters={filters} onClose={() => setSheet(null)} />}
    </>
  );
}

/** Everyone, him, her or unisex: one choice, with an indicator that glides between them. */
function AudienceSwitch({ filters }: { filters: ShopFilters }) {
  const options: (Audience | undefined)[] = [undefined, ...audiences];
  const index = options.indexOf(filters.audience);
  return (
    <nav
      className={styles.audience}
      aria-label={shop.groups.audience}
      style={{ '--count': options.length, '--index': index } as CSSProperties}
    >
      <span className={styles.audienceIndicator} aria-hidden="true" />
      {options.map((audience) => (
        <Link
          key={audience ?? 'all'}
          href={shopUrl({ ...filters, audience })}
          {...linkProps}
          className={styles.audienceOption}
          aria-current={filters.audience === audience ? 'true' : undefined}
        >
          {audience ? audienceLabels[audience] : shop.all}
        </Link>
      ))}
    </nav>
  );
}

/** A tickable option in a dropdown, with how many bottles it would leave you with. */
function OptionLink({
  href,
  active,
  label,
  count,
}: {
  href: Route;
  active: boolean;
  label: string;
  count: number;
}) {
  const content = (
    <>
      <span className={styles.box} aria-hidden="true">
        <CheckIcon />
      </span>
      <span className={styles.optionLabel}>{label}</span>
      <span className={styles.optionCount}>{count}</span>
    </>
  );
  if (count === 0 && !active) {
    return (
      <span className={styles.option} aria-disabled="true">
        {content}
      </span>
    );
  }
  return (
    <Link
      href={href}
      {...linkProps}
      className={styles.option}
      aria-current={active ? 'true' : undefined}
    >
      {content}
    </Link>
  );
}

/** A scent family option in the Scent dropdown, with an arched swatch pip and fragrance notes. */
function FamilyOptionLink({
  href,
  active,
  family,
  count,
}: {
  href: Route;
  active: boolean;
  family: Family;
  count: number;
}) {
  const [from, to] = familySwatches[family].colours;
  const content = (
    <>
      <span className={styles.box} aria-hidden="true">
        <CheckIcon />
      </span>
      <span
        className={styles.familySwatchPip}
        style={{ '--from': from, '--to': to } as CSSProperties}
        aria-hidden="true"
      />
      <span className={styles.familyText}>
        <span className={styles.familyTitle}>{familyLabels[family]}</span>
        <span className={styles.familyNotes}>{familySwatches[family].notes}</span>
      </span>
      <span className={styles.optionCount}>{count}</span>
    </>
  );
  if (count === 0 && !active) {
    return (
      <span className={styles.familyOption} aria-disabled="true">
        {content}
      </span>
    );
  }
  return (
    <Link
      href={href}
      {...linkProps}
      className={styles.familyOption}
      aria-current={active ? 'true' : undefined}
    >
      {content}
    </Link>
  );
}

/** Phones: the sort choices in a small sheet. */
function SortSheet({ filters, onClose }: { filters: ShopFilters; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className={cx(styles.sheet, styles.sortSheet)}
      aria-labelledby="sort-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className={styles.sheetHead}>
        <span className={styles.handle} aria-hidden="true" />
        <h2 id="sort-title" className={styles.sheetTitle}>
          {shop.sort}
        </h2>
        <button
          type="button"
          className={styles.sheetClose}
          onClick={() => dialogRef.current?.close()}
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>
      <ul className={styles.sortList}>
        {sortOptions.map((option) => (
          <li key={option}>
            <Link
              href={shopUrl({ ...filters, sort: option })}
              {...linkProps}
              className={styles.sortOption}
              aria-current={filters.sort === option ? 'true' : undefined}
              onClick={() => dialogRef.current?.close()}
            >
              {sortLabels[option]}
              <span className={styles.radio} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
