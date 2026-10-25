import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition } from 'react';
import { brandHref } from '@/content/routes';
import type { Brand } from '@/lib/catalog';
import styles from './AisleCard.module.css';

type AisleCardProps = {
  brand: Brand;
  aisle: number;
  productCount: number;
};

export function AisleCard({ brand, aisle, productCount }: AisleCardProps) {
  return (
    <Link href={brandHref(brand.slug)} transitionTypes={['walk-in']} className={styles.card}>
      <div className={styles.media}>
        <ViewTransition name={`aisle-${brand.slug}`} share="aisle-morph" default="none">
          <Image
            src={brand.image}
            alt=""
            sizes="(max-width: 959px) 100vw, min(30vw, 432px)"
            placeholder="blur"
            className={styles.image}
            style={{ objectPosition: brand.imagePosition }}
          />
        </ViewTransition>
        <span className={styles.number}>Aisle {String(aisle).padStart(2, '0')}</span>
      </div>
      <h2 className={styles.name}>{brand.name}</h2>
      <p className={styles.tagline}>{brand.tagline}</p>
      <p className={styles.count}>
        {productCount} {productCount === 1 ? 'fragrance' : 'fragrances'} →
      </p>
    </Link>
  );
}
