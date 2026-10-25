import { ButtonLink } from '@/components/ui/ButtonLink';
import { EyebrowPill } from '@/components/ui/EyebrowPill';
import { Lines } from '@/components/ui/Lines';
import { hero } from '@/content/home';
import styles from './Hero.module.css';

/**
 * The wordmark, set the way the original heading was: one tight line across
 * the page. The pill, tagline and the way into the shop share one line above
 * it, so the store tour starts right under the name.
 */
export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <EyebrowPill label={hero.eyebrow} className={styles.pill} />
      <p className={styles.tagline}>
        <Lines lines={hero.tagline} />
      </p>
      <ButtonLink href={hero.cta.href} className={styles.cta}>
        {hero.cta.label}
      </ButtonLink>
      <h1 id="hero-title" className={styles.title}>
        <span className={styles.titleText}>{hero.title}</span>
      </h1>
    </section>
  );
}
