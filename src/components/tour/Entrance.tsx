'use client';

import { motion, type MotionStyle } from 'motion/react';
import type { Route } from 'next';
import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowRightIcon } from '@/components/icons';
import { Lines } from '@/components/ui/Lines';
import { tour } from '@/content/home';
import { cx } from '@/lib/cx';
import styles from './Entrance.module.css';

export type EntranceFrame = {
  href: Route;
  brandName: string;
  name: string;
  concentration: string;
  image: StaticImageData;
  alt: string;
};

/** Scroll-driven styles from the tour; absent when the entrance stands still. */
export type EntranceMotion = {
  portal: MotionStyle;
  scene: MotionStyle;
  wall: MotionStyle;
  gallery: MotionStyle;
  casing: MotionStyle;
  cue: MotionStyle;
};

type EntranceProps = {
  frames: readonly EntranceFrame[];
  motionStyles?: EntranceMotion;
};

/**
 * The way in: a gallery wall with two framed photographs and an arched doorway
 * looking onto the shopfront. Scrolling opens the arch to the whole facade.
 */
export function Entrance({ frames, motionStyles }: EntranceProps) {
  const { storefront, label } = tour.entrance;

  return (
    <div
      className={styles.entrance}
      style={
        {
          '--focus-x': storefront.focus.x,
          '--focus-y': storefront.focus.y,
        } as CSSProperties
      }
    >
      <motion.div className={styles.wall} style={motionStyles?.wall} />

      <motion.div className={styles.portal} style={motionStyles?.portal}>
        <motion.div className={styles.scene} style={motionStyles?.scene}>
          <Image
            src={storefront.src}
            alt={storefront.alt}
            fill
            sizes="100vw"
            placeholder="blur"
            loading="eager"
            className={styles.sceneImage}
          />
        </motion.div>
      </motion.div>

      <motion.span className={styles.casing} style={motionStyles?.casing} aria-hidden="true" />

      <motion.div className={styles.gallery} style={motionStyles?.gallery}>
        <p className={styles.label}>
          <span className={styles.labelEyebrow}>{label.eyebrow}</span>
          <span className={styles.labelText}>
            <Lines lines={label.text} />
          </span>
        </p>

        <ul className={styles.frames}>
          {frames.map((frame, index) => (
            <li
              key={frame.href}
              className={cx(styles.frame, index === 0 ? styles.first : styles.second)}
            >
              <Link
                href={frame.href}
                transitionTypes={['nav-forward']}
                className={styles.frameLink}
              >
                <span className={styles.moulding}>
                  <span className={styles.photo}>
                    <Image
                      src={frame.image}
                      alt={frame.alt}
                      sizes="(max-width: 959px) 38vw, 19vw"
                      loading="eager"
                      placeholder="blur"
                      className={styles.photoImage}
                    />
                  </span>
                </span>
                <span className={styles.caption}>
                  <span className={styles.index}>No. {String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.brand}>{frame.brandName}</span>
                  <span className={styles.name}>
                    {frame.name}
                    <span className={styles.concentration}>{frame.concentration}</span>
                  </span>
                  <span className={styles.shop}>
                    Shop now
                    <ArrowRightIcon className={styles.shopArrow} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>

      {motionStyles && (
        <motion.div className={styles.cue} style={motionStyles.cue}>
          <span>{tour.scrollCue}</span>
          <span className={styles.cueLine} aria-hidden="true" />
          <a href="#aisles" className={styles.skip}>
            {tour.skipLabel}
          </a>
        </motion.div>
      )}
    </div>
  );
}
