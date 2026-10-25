'use client';

import { motion, type MotionStyle } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties, Fragment, memo, startTransition, useState } from 'react';
import { ArrowRightIcon } from '@/components/icons';
import heroBottle from '@/assets/images/bottles/chanel-no5.webp';
import chandelier from '@/assets/images/store/chandelier.webp';
import marbleFloor from '@/assets/images/store/marble-floor.jpg';
import marbleWall from '@/assets/images/store/marble-wall.jpg';
import { storeFloor } from '@/content/home';
import { flags } from '@/lib/flags';
import { cabinetFrontX, cabinetPlacement, type Layout, ROOM, type TourPlan } from '@/lib/tour-plan';
import { AvaGuide } from './AvaGuide';
import { CabinetBox } from './CabinetBox';
import { CabinetRoom } from './CabinetRoom';
import type { CabinetData } from './cabinet-types';
import styles from './Gallery.module.css';
import { Placard } from './Placard';

export const stopAnchorId = (index: number) => `tour-stop-${index}`;

type GalleryProps = {
  cabinets: readonly CabinetData[];
  plan: TourPlan;
  layout: Layout;
  /** Scroll-driven styles; absent when the floor stands still (reduced motion). */
  motionStyles?: { camera: MotionStyle; reveal: MotionStyle };
  stop: { index: number; moving: boolean };
  arrived: boolean;
};

/**
 * The store floor, after the reference boutique: a marble gallery with lit
 * display cases down both walls, built in CSS 3D so it has real depth.
 * Scrolling walks the camera from case to case; a placard (or Ava, when she's
 * switched on) says what each house is and how to step inside.
 */
export function Gallery({ cabinets, plan, layout, motionStyles, stop, arrived }: GalleryProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const openCabinet = cabinets.find((cabinet) => cabinet.slug === openSlug);
  // A transition, so the case on the floor can grow into the room.
  const open = (slug: string | null) => startTransition(() => setOpenSlug(slug));
  const still = !motionStyles;
  const current = plan.stops[stop.index]!;
  const active = arrived && !stop.moving && current.kind === 'cabinet' ? current.cabinet : -1;

  return (
    <div className={styles.gallery} data-arrived={arrived} data-still={still || undefined}>
      {still ? (
        <StillFloor cabinets={cabinets} openSlug={openSlug} onOpen={open} />
      ) : (
        <motion.div className={styles.viewport} style={motionStyles.reveal}>
          <motion.div className={styles.world} style={motionStyles.camera}>
            <Room
              cabinets={cabinets}
              plan={plan}
              openSlug={openSlug}
              onOpen={open}
              lit={arrived}
              active={active}
            />
          </motion.div>
          <span className={styles.vignette} aria-hidden="true" />
        </motion.div>
      )}

      {flags.ava ? (
        <AvaGuide
          cabinets={cabinets}
          plan={plan}
          layout={layout}
          stop={still ? { index: 0, moving: false } : stop}
          arrived={arrived}
          paused={Boolean(openSlug)}
          still={still}
          onOpen={open}
        />
      ) : (
        !still && (
          <Placard
            stop={current}
            cabinets={cabinets}
            moving={stop.moving}
            visible={arrived && !openSlug}
            onOpen={open}
          />
        )
      )}

      {!still && arrived && (
        <a href="#tour-end" className={styles.skip}>
          {storeFloor.skip}
        </a>
      )}

      {openCabinet && <CabinetRoom cabinet={openCabinet} onClose={() => open(null)} />}
    </div>
  );
}

/* ==========================================================================
   The room (3D). Memoised: it only changes when the lights or the stop do.
   ========================================================================== */

/** A w × h plane (cqh), centred on (x, y, z) and turned to face the right way. */
const place = (w: number, h: number, x: number, y: number, z: number, turn = '') =>
  ({
    width: `${w}cqh`,
    height: `${h}cqh`,
    marginLeft: `${-w / 2}cqh`,
    marginTop: `${-h / 2}cqh`,
    transform: `translate3d(${x}cqh, ${y}cqh, ${z}cqh) ${turn}`,
  }) satisfies CSSProperties;

const FLAT = 'rotateX(90deg)';
const OVERHEAD = 'rotateX(-90deg)';

const W = ROOM.halfWidth;
const HEIGHT = ROOM.floor - ROOM.ceiling;
const MID_Y = (ROOM.ceiling + ROOM.floor) / 2;
const WALL_LENGTH = ROOM.front - ROOM.back;
const WALL_Z = (ROOM.front + ROOM.back) / 2;
// The floor and ceiling run on behind you, under the doorway you walked in by.
const FLOOR_FRONT = 420;
const FLOOR_LENGTH = FLOOR_FRONT - ROOM.back;
const FLOOR_Z = (FLOOR_FRONT + ROOM.back) / 2;
/** Coffered ceiling: a low band along each wall, a raised centre, a lit cove between. */
const BAND = 34;
const COFFER = 10;
const RAISED = ROOM.ceiling - COFFER;
/** Brass posts between the cabinets, and at either end of each run. */
const POSTS = [-65, -155, -245, -335, -425];
const CHANDELIERS = [-30, -190, -320];
const RUNNER = { width: 40, front: 150, back: ROOM.back + 46 };
const PODIUM = { width: 26, height: 20, depth: 20, z: ROOM.back + 34 };
const FEATURE = { width: 66, height: 98, depth: 6 };
const CASE = ROOM.cabinet;

type RoomProps = {
  cabinets: readonly CabinetData[];
  plan: TourPlan;
  openSlug: string | null;
  onOpen: (slug: string) => void;
  /** The store's lights are on: you're through the door. */
  lit: boolean;
  /** The cabinet you're standing at, or -1. */
  active: number;
};

const Room = memo(function Room({ cabinets, plan, openSlug, onOpen, lit, active }: RoomProps) {
  const textures = {
    '--marble-wall': `url(${marbleWall.src})`,
    '--marble-floor': `url(${marbleFloor.src})`,
  } as CSSProperties;

  return (
    <div className={styles.room} style={textures} data-lit={lit}>
      {/* ---------- The floor, a runner down the middle, pools of light ---------- */}
      <div
        className={styles.floor}
        style={place(2 * W, FLOOR_LENGTH, 0, ROOM.floor, FLOOR_Z, FLAT)}
      />
      <div
        className={styles.runner}
        style={place(
          RUNNER.width,
          RUNNER.front - RUNNER.back,
          0,
          ROOM.floor - 0.1,
          (RUNNER.front + RUNNER.back) / 2,
          FLAT,
        )}
      />
      {CHANDELIERS.map((z) => (
        <span key={z} className={styles.pool} style={place(96, 96, 0, ROOM.floor - 0.2, z, FLAT)} />
      ))}

      {/* ---------- The coffered ceiling ---------- */}
      {[-1, 1].map((side) => (
        // Fragments, not wrappers: an extra element would flatten its children out of 3D.
        <Fragment key={side}>
          <div
            className={styles.band}
            data-side={side}
            style={place(
              BAND,
              FLOOR_LENGTH,
              side * (W - BAND / 2),
              ROOM.ceiling,
              FLOOR_Z,
              OVERHEAD,
            )}
          />
          <div
            className={styles.cove}
            style={place(
              FLOOR_LENGTH,
              COFFER,
              side * (W - BAND),
              ROOM.ceiling - COFFER / 2,
              FLOOR_Z,
              `rotateY(${side * -90}deg)`,
            )}
          />
        </Fragment>
      ))}
      <div
        className={styles.raised}
        style={place(2 * (W - BAND), FLOOR_LENGTH, 0, RAISED, FLOOR_Z, OVERHEAD)}
      />

      {/* ---------- Walls and brass posts ---------- */}
      <div
        className={styles.wall}
        style={place(WALL_LENGTH, HEIGHT, W, MID_Y, WALL_Z, 'rotateY(-90deg)')}
      />
      <div
        className={styles.wall}
        style={place(WALL_LENGTH, HEIGHT, -W, MID_Y, WALL_Z, 'rotateY(90deg)')}
      />
      {POSTS.map((z) => (
        <Fragment key={z}>
          <span
            className={styles.post}
            style={place(1.4, HEIGHT, W - 0.6, MID_Y, z, 'rotateY(-90deg)')}
          />
          <span
            className={styles.post}
            style={place(1.4, HEIGHT, -W + 0.6, MID_Y, z, 'rotateY(90deg)')}
          />
        </Fragment>
      ))}

      {/* ---------- The far end: feature wall, podium, one bottle in the spotlight ---------- */}
      <div
        className={styles.back}
        style={place(2 * W, ROOM.floor - RAISED, 0, (RAISED + ROOM.floor) / 2, ROOM.back)}
      />
      <FeatureWall />
      <Podium />

      {CHANDELIERS.map((z) => (
        <div key={z} className={styles.chandelier} style={place(30, 42, 0, RAISED + 21, z)}>
          <Image src={chandelier} alt="" fill sizes="25vw" className={styles.chandelierImage} />
          <span className={styles.chandelierGlow} />
        </div>
      ))}

      {/* ---------- The cabinets, each under its own downlight ---------- */}
      {cabinets.map((cabinet, index) => {
        const { wall, z } = cabinetPlacement(index);
        const sign = wall === 'right' ? 1 : -1;
        const turn = `rotateY(${-90 * sign}deg)`;
        const front = cabinetFrontX(wall);
        const stopIndex = plan.stops.findIndex(
          (stop) => stop.kind === 'cabinet' && stop.cabinet === index,
        );
        // The lights come on case by case as you arrive.
        const delay = { '--light-delay': `${300 + index * 120}ms` } as CSSProperties;
        return (
          <Fragment key={cabinet.slug}>
            <span
              className={styles.washer}
              style={{ ...place(64, 86, sign * (W - 0.4), ROOM.ceiling + 43, z, turn), ...delay }}
            />
            <span
              className={styles.downlight}
              style={{
                ...place(5, 5, front + sign * 6, ROOM.ceiling + 0.1, z, OVERHEAD),
                ...delay,
              }}
            />
            <span
              className={styles.spill}
              style={{ ...place(40, 64, front - sign * 12, ROOM.floor - 0.15, z, FLAT), ...delay }}
            />
            <span
              className={styles.contact}
              style={place(8, CASE.width + 6, front - sign * 1.5, ROOM.floor - 0.18, z, FLAT)}
            />
            <div
              className={styles.slot}
              style={{ ...place(CASE.width, CASE.height, front, CASE.centreY, z, turn), ...delay }}
            >
              <CabinetBox
                cabinet={cabinet}
                variant="floor"
                lit={lit}
                active={index === active}
                named={cabinet.slug !== openSlug}
                onOpen={() => onOpen(cabinet.slug)}
                onFocus={(event) => {
                  // Keyboard visitors are walked to the cabinet they tab to.
                  if (event.currentTarget.matches(':focus-visible')) {
                    document
                      .getElementById(stopAnchorId(stopIndex))
                      ?.scrollIntoView({ block: 'start' });
                  }
                }}
              />
            </div>
          </Fragment>
        );
      })}
    </div>
  );
});

/** The house panel stands proud of the back wall, lit from above. */
function FeatureWall() {
  const { width, height, depth } = FEATURE;
  const y = ROOM.floor - height / 2 - 6;
  return (
    <>
      <div
        className={styles.feature}
        style={place(width, height, 0, y, ROOM.back + depth)}
        aria-hidden="true"
      >
        <span className={styles.monogram}>PH</span>
        <span className={styles.wordmark}>Perfume Hut</span>
        <span className={styles.featureLine}>Designer fragrance</span>
      </div>
      {[-1, 1].map((side) => (
        <span
          key={side}
          className={styles.featureSide}
          style={place(
            depth,
            height,
            (side * width) / 2,
            y,
            ROOM.back + depth / 2,
            `rotateY(${side * 90}deg)`,
          )}
        />
      ))}
    </>
  );
}

/** A marble podium in front of the feature wall, with one bottle under a spotlight. */
function Podium() {
  const { width, height, depth, z } = PODIUM;
  const top = ROOM.floor - height;
  return (
    <>
      <span
        className={styles.beam}
        style={place(44, top - RAISED, 0, (RAISED + top) / 2, z - depth / 2)}
      />
      {[-1, 1].map((side) => (
        <span
          key={side}
          className={styles.podiumSide}
          style={place(
            depth,
            height,
            (side * width) / 2,
            top + height / 2,
            z,
            `rotateY(${side * 90}deg)`,
          )}
        />
      ))}
      <span className={styles.podiumTop} style={place(width, depth, 0, top, z, FLAT)} />
      <span
        className={styles.podiumFront}
        style={place(width, height, 0, top + height / 2, z + depth / 2)}
      />
      <div className={styles.hero} style={place(12, 18, 0, top - 9, z)}>
        <Image src={heroBottle} alt="" fill sizes="10vw" className={styles.heroImage} />
      </div>
    </>
  );
}

/** Reduced motion: the floor as one still wall of display cases. */
function StillFloor({
  cabinets,
  openSlug,
  onOpen,
}: {
  cabinets: readonly CabinetData[];
  openSlug: string | null;
  onOpen: (slug: string) => void;
}) {
  const { intro, still, browseAll } = storeFloor;
  return (
    <div
      className={styles.still}
      style={{ '--marble-wall': `url(${marbleWall.src})` } as CSSProperties}
    >
      <div className={styles.stillIntro}>
        <p className={styles.stillEyebrow}>{intro.eyebrow}</p>
        <h2 className={styles.stillTitle}>
          {intro.title[0]}
          <br />
          {intro.title[1]}
        </h2>
        <p className={styles.stillText}>{still}</p>
        <Link href={browseAll.href} className={styles.stillLink}>
          {browseAll.label}
          <ArrowRightIcon className={styles.stillArrow} />
        </Link>
      </div>
      <ul className={styles.stillRow} aria-label="House cabinets">
        {cabinets.map((cabinet) => (
          <li key={cabinet.slug} className={styles.stillSlot}>
            <CabinetBox
              cabinet={cabinet}
              variant="floor"
              named={cabinet.slug !== openSlug}
              onOpen={() => onOpen(cabinet.slug)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
