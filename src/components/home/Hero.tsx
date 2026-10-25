import { ButtonLink } from '@/components/ui/ButtonLink';
import { EyebrowPill } from '@/components/ui/EyebrowPill';
import { Lines } from '@/components/ui/Lines';
import { hero } from '@/content/home';
import { formatMoney, type Money } from '@/lib/money';
import styles from './Hero.module.css';

type HeroProps = {
  /** The lowest price on the shelves. */
  startingPrice: Money;
};

/** The wordmark, set the way the original heading was: one tight line across the page. */
export function Hero({ startingPrice }: HeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <EyebrowPill label={hero.eyebrow} className={styles.pill} />
      <p className={styles.tagline}>
        <Lines lines={hero.tagline} />
      </p>
      <h1 id="hero-title" className={styles.title}>
        <span className={styles.titleText}>{hero.title}</span>
      </h1>

      <div className={styles.cta}>
        <p className={styles.price}>
          <span className={styles.priceLabel}>{hero.priceLabel}</span>
          <span className={styles.priceValue}>{formatMoney(startingPrice)}</span>
        </p>
        <ButtonLink href={hero.cta.href}>{hero.cta.label}</ButtonLink>
      </div>
    </section>
  );
}
