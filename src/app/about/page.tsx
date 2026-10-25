import type { Metadata } from 'next';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowRightIcon } from '@/components/icons';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EyebrowPill } from '@/components/ui/EyebrowPill';
import { Lines } from '@/components/ui/Lines';
import { PageTransition } from '@/components/ui/PageTransition';
import { about } from '@/content/about';
import { routes } from '@/content/routes';
import { countProductsByBrand, getBrands, getProducts } from '@/lib/catalog';
import { cx } from '@/lib/cx';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About us',
  description:
    'Perfume Hut started behind real fragrance counters. Authentic designer fragrance, curated aisle by aisle.',
  alternates: { canonical: '/about' },
};

const indexLabel = (index: number) => String(index + 1).padStart(2, '0');
const stagger = (index: number, step: number) =>
  ({ '--reveal-delay': `${index * step}%` }) as CSSProperties;

export default async function AboutPage() {
  const [brands, products] = await Promise.all([getBrands(), getProducts()]);
  const houses = Object.keys(countProductsByBrand()).length;
  const { hero, promises, journey, closing } = about;

  const facts = [
    { value: String(houses), label: 'Houses on our shelves' },
    { value: String(products.length), label: 'Signatures in stock' },
    { value: '100%', label: 'Sealed & authentic' },
  ];

  return (
    <PageTransition>
      {/* ---------- Opening: the story beside an arched doorway ---------- */}
      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.heroText}>
          <EyebrowPill label={about.eyebrow} />
          <h1 id="about-title" className={styles.title}>
            <Lines lines={about.title} />
          </h1>
          <p className={styles.intro}>{about.intro}</p>
        </div>

        <div className={styles.heroArch}>
          <div className={cx(styles.arch, styles.heroArchFrame)}>
            <div className={styles.archPhoto}>
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                sizes="(max-width: 959px) calc(100vw - 52px), 36vw"
                placeholder="blur"
                loading="eager"
                fetchPriority="high"
                className={styles.archImage}
              />
            </div>
          </div>
        </div>

        <dl className={styles.facts}>
          {facts.map((fact, index) => (
            <div key={fact.label} className={cx(styles.fact, 'reveal')} style={stagger(index, 6)}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- Promises: three niches along one wall ---------- */}
      <section className={styles.promises} aria-labelledby="promises-heading">
        <header className={cx(styles.sectionHead, 'reveal')}>
          <EyebrowPill label={promises.eyebrow} />
          <h2 id="promises-heading" className={styles.sectionTitle}>
            <Lines lines={promises.heading} breaks="always" />
          </h2>
        </header>

        {/* The reveal sits on the scroller itself: inside it, a view timeline would track the row. */}
        <div
          className={cx(styles.niches, 'reveal')}
          role="region"
          aria-label={promises.eyebrow}
          // The row scrolls sideways on phones; keyboard users can focus it and use the arrow keys.
          tabIndex={0}
        >
          <ol className={styles.nicheList}>
            {promises.items.map((item, index) => (
              <li key={item.title} className={styles.niche}>
                <div className={styles.arch}>
                  <div className={styles.archPhoto}>
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes="(max-width: 959px) 76vw, 30vw"
                      placeholder="blur"
                      className={styles.archImage}
                    />
                  </div>
                </div>
                <div className={styles.nicheHead}>
                  <span className={styles.index}>{indexLabel(index)}</span>
                  <ArrowRightIcon className={styles.arrow} />
                </div>
                <h3 className={styles.nicheTitle}>{item.title}</h3>
                <p className={styles.nicheText}>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Journey: the one dark panel on the page ---------- */}
      <section className={styles.journey} aria-labelledby="journey-heading">
        <div className={cx(styles.journeyMedia, 'reveal-clip')}>
          <Image
            src={journey.image.src}
            alt={journey.image.alt}
            fill
            sizes="(max-width: 959px) 100vw, 50vw"
            placeholder="blur"
            className={styles.journeyImage}
          />
        </div>

        <div className={styles.journeyBody}>
          <EyebrowPill label={journey.eyebrow} />
          <h2 id="journey-heading" className={cx(styles.journeyTitle, 'reveal')}>
            <Lines lines={journey.heading} breaks="always" />
          </h2>
          <ol className={styles.steps}>
            {journey.steps.map((step, index) => (
              <li key={step.title} className={cx(styles.step, 'reveal')} style={stagger(index, 5)}>
                <div className={styles.stepRow}>
                  <span className={styles.stepIndex} aria-hidden="true">
                    {indexLabel(index)}
                  </span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <ArrowRightIcon className={styles.stepArrow} />
                </div>
                <p className={styles.stepText}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Closing: an open doorway ---------- */}
      <section className={styles.closing} aria-labelledby="closing-heading">
        <div className={cx(styles.doorway, 'reveal')}>
          <div className={styles.doorwayInner}>
            <EyebrowPill label={closing.eyebrow} />
            <h2 id="closing-heading" className={styles.closingTitle}>
              <Lines lines={closing.title} />
            </h2>
            <div className={styles.closingActions}>
              <ButtonLink href={routes.home} className={styles.doorButton}>
                {closing.tour}
              </ButtonLink>
              <ButtonLink
                href={routes.brands}
                tone="light"
                className={cx(styles.doorButton, styles.paperButton)}
              >
                Browse {brands.length} aisles
              </ButtonLink>
            </div>
          </div>
        </div>
        <p className={styles.live}>{closing.live}</p>
      </section>
    </PageTransition>
  );
}
