import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties, type FocusEventHandler, Fragment, ViewTransition } from 'react';
import { shelve } from '@/lib/ava-speech';
import { cx } from '@/lib/cx';
import { ROOM } from '@/lib/tour-plan';
import { type CabinetData, cabinetTransitionName, type ShelfBottle } from './cabinet-types';
import styles from './CabinetBox.module.css';

/*
 * A display case built in CSS 3D, measured in `--u` (set by whoever places it:
 * the stage's cqh on the floor, a viewport-based unit in the room). Origin is
 * the centre of the front face; the case runs back `depth` into the wall.
 */
const { width: W, height: H, depth: D } = ROOM.cabinet;
const STILE = 2.6;
const HEADER = 11;
const BASE = 12;
const IW = W - 2 * STILE;
const IH = H - HEADER - BASE;
const TOP = -H / 2 + HEADER;
const MID = TOP + IH / 2;
const INNER = D - 0.6;
const BOTTLE_Z = -D * 0.55;
const COMPARTMENT = IH / 3;

const u = (n: number) => `calc(${n} * var(--u))`;

/** A w × h face centred on (x, y, z), then turned. */
const face = (w: number, h: number, x: number, y: number, z: number, turn = '') =>
  ({
    width: u(w),
    height: u(h),
    marginLeft: u(-w / 2),
    marginTop: u(-h / 2),
    transform: `translate3d(${u(x)}, ${u(y)}, ${u(z)}) ${turn}`,
  }) satisfies CSSProperties;

type CabinetBoxProps = {
  cabinet: CabinetData;
  variant: 'floor' | 'room';
  /** The store's lights are on. */
  lit?: boolean;
  /** The case you're standing at: brighter, with a sweep of light across the glass. */
  active?: boolean;
  /** Carries the shared view-transition name (off while its room is open). */
  named?: boolean;
  onOpen?: () => void;
  onFocus?: FocusEventHandler<HTMLButtonElement>;
  /** Room only: Ava's pick, highlighted on its shelf. */
  pickSlug?: string;
  pickLabel?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * A house's display case with real depth: cream lacquer sides, a lit back,
 * glass shelves with LED edges and the bottles standing at mid-depth. On the
 * floor the whole case is a button; in the room the bottles are links and
 * the glass doors swing open.
 */
export function CabinetBox({
  cabinet,
  variant,
  lit = true,
  active = false,
  named = true,
  onOpen,
  onFocus,
  pickSlug,
  pickLabel,
  className,
  style,
}: CabinetBoxProps) {
  const shelves = shelve(cabinet.bottles);
  const room = variant === 'room';

  const body = (
    <span className={styles.body}>
      {/* The carcass: outer sides, then the inside of the case. */}
      <span
        className={cx(styles.side, styles.sideLeft)}
        style={face(D, H, -W / 2, 0, -D / 2, 'rotateY(-90deg)')}
      />
      <span
        className={cx(styles.side, styles.sideRight)}
        style={face(D, H, W / 2, 0, -D / 2, 'rotateY(90deg)')}
      />
      <span className={styles.back} style={face(IW, IH, 0, MID, -INNER)} />
      <span
        className={cx(styles.inner, styles.innerLeft)}
        style={face(INNER, IH, -IW / 2, MID, -INNER / 2, 'rotateY(90deg)')}
      />
      <span
        className={cx(styles.inner, styles.innerRight)}
        style={face(INNER, IH, IW / 2, MID, -INNER / 2, 'rotateY(-90deg)')}
      />
      <span
        className={styles.ceiling}
        style={face(IW, INNER, 0, TOP, -INNER / 2, 'rotateX(-90deg)')}
      />
      <span
        className={styles.floor}
        style={face(IW, INNER, 0, TOP + IH, -INNER / 2, 'rotateX(90deg)')}
      />

      {/* Glass shelves with an LED strip along each front edge. */}
      {[1, 2].map((k) => {
        const y = TOP + COMPARTMENT * k;
        return (
          // A Fragment, not a wrapper: an extra element would flatten the faces out of 3D.
          <Fragment key={k}>
            <span
              className={styles.shelf}
              style={face(IW, INNER - 1, 0, y, -(INNER - 1) / 2 - 0.4, 'rotateX(90deg)')}
            />
            <span className={styles.led} style={face(IW, 0.7, 0, y + 0.35, -0.9)} />
          </Fragment>
        );
      })}

      {/* Bottles stand at mid-depth on each shelf. */}
      {shelves.map((shelf, index) => (
        <span
          key={index}
          className={styles.compartment}
          style={face(IW, COMPARTMENT, 0, TOP + COMPARTMENT * (index + 0.5), BOTTLE_Z)}
        >
          {shelf.map((bottle) =>
            room ? (
              <ShelfLink
                key={bottle.slug}
                bottle={bottle}
                pick={bottle.slug === pickSlug}
                pickLabel={pickLabel}
              />
            ) : (
              <Image
                key={bottle.slug}
                src={bottle.cutout}
                alt=""
                sizes="(max-width: 959px) 16vw, 7vw"
                className={styles.bottle}
              />
            ),
          )}
        </span>
      ))}

      <span className={styles.glass} style={face(IW, IH, 0, MID, -0.3)} />

      {/* The front: header with the house name, two stiles, and the plinth. */}
      <span className={styles.header} style={face(W, HEADER, 0, -H / 2 + HEADER / 2, 0)}>
        <span className={styles.number}>No. {String(cabinet.number).padStart(2, '0')}</span>
        <span className={styles.name}>{cabinet.name}</span>
      </span>
      <span className={styles.stile} style={face(STILE, IH, -W / 2 + STILE / 2, MID, 0)} />
      <span className={styles.stile} style={face(STILE, IH, W / 2 - STILE / 2, MID, 0)} />
      <span className={styles.base} style={face(W, BASE, 0, H / 2 - BASE / 2, 0)}>
        <span className={styles.plaque}>{cabinet.tagline}</span>
      </span>

      {room && (
        <>
          <Door side="left" />
          <Door side="right" />
        </>
      )}
    </span>
  );

  const box = named ? (
    <ViewTransition name={cabinetTransitionName(cabinet.slug)} share="cabinet-morph" default="none">
      {body}
    </ViewTransition>
  ) : (
    <span className={styles.open}>{body}</span>
  );

  const shared = {
    className: cx(styles.box, room && styles.room, className),
    style,
    'data-lit': lit,
    'data-active': active || room,
  };

  if (room) return <div {...shared}>{box}</div>;

  const count = cabinet.bottles.length;
  return (
    <button
      type="button"
      {...shared}
      onClick={onOpen}
      onFocus={onFocus}
      data-cabinet={cabinet.slug}
      aria-label={`Visit the ${cabinet.name} cabinet, ${count} ${count === 1 ? 'fragrance' : 'fragrances'}`}
    >
      {box}
    </button>
  );
}

/** Glass doors in brass frames, hinged at the outer stiles; they swing open in 3D. */
function Door({ side }: { side: 'left' | 'right' }) {
  const x = side === 'left' ? -IW / 2 : IW / 2;
  return (
    <span className={styles.hinge} style={face(0, IH, x, MID, 0.2)}>
      <span className={cx(styles.door, side === 'left' ? styles.doorLeft : styles.doorRight)} />
    </span>
  );
}

function ShelfLink({
  bottle,
  pick,
  pickLabel,
}: {
  bottle: ShelfBottle;
  pick: boolean;
  pickLabel?: string;
}) {
  return (
    <Link
      href={bottle.href}
      transitionTypes={['nav-forward']}
      className={styles.item}
      data-pick={pick || undefined}
    >
      {pick && pickLabel && <span className={styles.pickTag}>{pickLabel}</span>}
      <Image
        src={bottle.cutout}
        alt=""
        sizes="(max-width: 959px) 24vw, 10vw"
        className={styles.bottle}
      />
      <span className={styles.tag}>
        <span className={styles.tagName}>{bottle.name}</span>
        <span className={styles.tagMeta}>
          {bottle.concentration} · {bottle.price}
        </span>
      </span>
    </Link>
  );
}
