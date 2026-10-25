import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowRightIcon } from '@/components/icons';
import { EyebrowPill } from '@/components/ui/EyebrowPill';
import { Lines } from '@/components/ui/Lines';
import { features } from '@/content/home';
import { cx } from '@/lib/cx';
import styles from './Features.module.css';

/** Grid slots for the four images and four items, in content order. */
const imageSlots = [styles.imagePetals, styles.imageHands, styles.imagePortrait, styles.imageBook];
const itemSlots = [styles.item01, styles.item02, styles.item03, styles.item04];

export function Features() {
  return (
    <section id="why" className={styles.features} aria-labelledby="features-heading">
      <div className={cx(styles.intro, 'reveal')}>
        <EyebrowPill label="Why Perfume Hut" />
        <h2 id="features-heading" className={styles.heading}>
          <Lines lines={features.heading} />
        </h2>
      </div>

      {features.images.map((image, index) => (
        <div
          key={image.alt}
          className={cx(styles.figure, imageSlots[index], 'reveal-clip')}
          style={{ '--reveal-delay': `${(index % 2) * 6}%` } as CSSProperties}
        >
          <Image
            src={image.src}
            alt={image.alt}
            sizes="(max-width: 959px) calc(50vw - 22px), min(23.9vw, 344px)"
            placeholder="blur"
            className={styles.image}
          />
        </div>
      ))}

      {features.items.map((item, index) => (
        <article key={item.index} className={cx(styles.item, itemSlots[index], 'reveal')}>
          <div className={styles.itemHead}>
            <span className={styles.index}>{item.index}</span>
            <ArrowRightIcon className={styles.arrow} />
          </div>
          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.description}>
            <Lines lines={item.description} />
          </p>
        </article>
      ))}
    </section>
  );
}
