import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { ButtonLink } from '@/components/ui/ButtonLink';
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

export default async function AboutPage() {
  const [brands, products] = await Promise.all([getBrands(), getProducts()]);
  const houses = Object.keys(countProductsByBrand()).length;

  const facts = [
    { value: String(houses), label: 'Houses on our shelves' },
    { value: String(products.length), label: 'Signatures in stock' },
    { value: '100%', label: 'Sealed & authentic' },
  ];

  return (
    <PageTransition>
      <PageHeader eyebrow="Our story" title={about.title} intro={about.intro} />

      <div className={cx(styles.hero, 'reveal-clip')}>
        <Image
          src={about.hero.src}
          alt={about.hero.alt}
          sizes="(max-width: 959px) 100vw, 95vw"
          placeholder="blur"
          className={styles.heroImage}
        />
      </div>

      <dl className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.label} className={cx(styles.fact, 'reveal')}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.chapters}>
        {about.chapters.map((chapter, index) => (
          <section
            key={chapter.title}
            className={cx(styles.chapter, index % 2 === 1 && styles.flipped)}
          >
            <div className={cx(styles.chapterMedia, 'reveal-clip')}>
              <Image
                src={chapter.image.src}
                alt={chapter.image.alt}
                sizes="(max-width: 959px) 100vw, 45vw"
                placeholder="blur"
                className={styles.chapterImage}
              />
            </div>
            <div className={cx(styles.chapterBody, 'reveal')}>
              <span className={styles.chapterIndex}>{String(index + 1).padStart(2, '0')}</span>
              <h2 className={styles.chapterTitle}>{chapter.title}</h2>
              <p className={styles.chapterText}>{chapter.body}</p>
            </div>
          </section>
        ))}
      </div>

      <section className={styles.closing}>
        <h2 className={cx(styles.closingTitle, 'reveal')}>
          The doors are open. Come in and look around.
        </h2>
        <div className={styles.closingActions}>
          <ButtonLink href={routes.home}>Take the store tour</ButtonLink>
          <ButtonLink href={routes.brands} tone="light">
            Browse {brands.length} aisles
          </ButtonLink>
        </div>
      </section>
    </PageTransition>
  );
}
