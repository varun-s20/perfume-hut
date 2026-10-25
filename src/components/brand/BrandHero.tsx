import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition } from 'react';
import { routes } from '@/content/routes';
import type { Brand } from '@/lib/catalog';
import styles from './BrandHero.module.css';

type BrandHeroProps = {
  brand: Brand;
  aisle: number;
  productCount: number;
};

/** The aisle you just walked into. Its photo is the morph target from the store floor. */
export function BrandHero({ brand, aisle, productCount }: BrandHeroProps) {
  return (
    <header className={styles.hero}>
      <ViewTransition name={`aisle-${brand.slug}`} share="aisle-morph" default="none">
        <Image
          src={brand.image}
          alt={brand.imageAlt}
          sizes="100vw"
          placeholder="blur"
          loading="eager"
          fetchPriority="high"
          className={styles.image}
          style={{ objectPosition: brand.imagePosition }}
        />
      </ViewTransition>
      <div className={styles.overlay}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href={routes.brands} transitionTypes={['nav-back']}>
            All aisles
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{brand.name}</span>
        </nav>
        <p className={styles.aisle}>
          Aisle {String(aisle).padStart(2, '0')} · {productCount}{' '}
          {productCount === 1 ? 'fragrance' : 'fragrances'}
        </p>
        <h1 className={styles.title}>{brand.name}</h1>
        <p className={styles.tagline}>{brand.tagline}</p>
      </div>
    </header>
  );
}
