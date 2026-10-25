import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowRightIcon } from '@/components/icons';
import { Lines } from '@/components/ui/Lines';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { notes } from '@/content/home';
import { cx } from '@/lib/cx';
import styles from './Notes.module.css';
import { StoryCard } from './StoryCard';

/** Bottle silhouettes differ slightly in width; sizes follow content order. */
const bottleSizes = [styles.bottleAmber, styles.bottlePeach, styles.bottleGreen];

export function Notes() {
  return (
    <section id="notes" className={styles.notes} aria-labelledby="notes-heading">
      <SectionIntro headingId="notes-heading" lines={notes.heading} />

      <div className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.stories}>
            {notes.stories.map((story) => (
              <StoryCard key={story.alt} story={story} author={notes.storyAuthor} />
            ))}
          </div>

          <ol className={styles.phases}>
            {notes.phases.map((phase, index) => (
              <li
                key={phase.index}
                className="reveal"
                style={{ '--reveal-delay': `${index * 5}%` } as CSSProperties}
              >
                <div className={styles.phaseRow}>
                  <span className={styles.phaseIndex} aria-hidden="true">
                    {phase.index}
                  </span>
                  <h3 className={styles.phaseTitle}>{phase.title}</h3>
                  <ArrowRightIcon className={styles.phaseArrow} />
                </div>
                <p className={styles.phaseDescription}>{phase.description}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.bottlesPanel}>
          <p className={cx(styles.lede, 'reveal')}>
            <Lines lines={notes.lede} />
          </p>
          <ul className={styles.bottles} aria-label="Shop by fragrance family">
            {notes.bottles.map((bottle, index) => (
              <li key={bottle.label}>
                <Link href={bottle.href} className={styles.bottleLink}>
                  <span className={styles.bottleShape}>
                    <Image
                      src={bottle.src}
                      alt={bottle.alt}
                      sizes="(max-width: 959px) 28vw, 130px"
                      className={cx(styles.bottle, bottleSizes[index])}
                    />
                  </span>
                  {bottle.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.caption}>
            <Lines lines={notes.caption} />
          </p>
        </div>

        <div className={styles.photo}>
          <Image
            src={notes.photo.src}
            alt={notes.photo.alt}
            sizes="(max-width: 959px) 100vw, min(47.4vw, 683px)"
            placeholder="blur"
            className={styles.photoImage}
          />
        </div>
      </div>
    </section>
  );
}
