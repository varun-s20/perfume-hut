import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ava } from '@/content/home';
import { AVA_CANVAS, type AvaPoseName, avaPoses, type Facing } from '@/data/ava-poses';
import type { MouthFrame } from '@/lib/ava-speech';
import { cx } from '@/lib/cx';
import styles from './AvaFigure.module.css';

type AvaFigureProps = {
  pose: AvaPoseName;
  /** The way she should face: towards whatever she's presenting. */
  facing: Facing;
  frame: MouthFrame;
  speaking: boolean;
  /** Walking between stops: a gentle step. */
  moving?: boolean;
  sizes: string;
  className?: string;
};

const poseNames = Object.keys(avaPoses) as AvaPoseName[];
const pct = (value: number) => `${(value / AVA_CANVAS) * 100}%`;

/**
 * Ava: every pose is stacked and the current one fades in, so gestures change
 * smoothly; her lips move with the mouth frames for that pose. Poses face one
 * way in the photographs, so she's mirrored when she should face the other.
 * A voiced, lip-synced avatar can replace this without touching the scenes.
 */
export function AvaFigure({
  pose,
  facing,
  frame,
  speaking,
  moving = false,
  sizes,
  className,
}: AvaFigureProps) {
  const natural = avaPoses[pose].facing;
  const mirrored = natural !== 'front' && facing !== 'front' && natural !== facing;

  return (
    <figure
      className={cx(styles.figure, className)}
      data-speaking={speaking}
      data-moving={moving}
      data-mirrored={mirrored}
      aria-label={ava.alt}
      role="img"
    >
      <div className={styles.body}>
        {poseNames.map((name) => {
          const { image, mouth } = avaPoses[name];
          const active = name === pose;
          return (
            <div key={name} className={styles.pose} data-active={active}>
              <Image src={image} alt="" fill sizes={sizes} className={styles.image} />
              <span
                className={styles.mouth}
                style={
                  {
                    left: pct(mouth.x),
                    top: pct(mouth.y),
                    width: pct(mouth.width),
                    height: pct(mouth.height),
                    backgroundImage: `url(${mouth.sprite.src})`,
                    '--frame': active ? frame : 0,
                  } as CSSProperties
                }
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>
    </figure>
  );
}
