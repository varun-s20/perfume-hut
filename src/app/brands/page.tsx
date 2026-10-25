import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { AisleCard } from '@/components/brand/AisleCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { countProductsByBrand, getAisleNumber, getBrands } from '@/lib/catalog';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Brands',
  description:
    'Walk the aisles at Perfume Hut: Versace, Gucci, Prada, Dior, Chanel, Yves Saint Laurent, Armani and Calvin Klein.',
  alternates: { canonical: '/brands' },
};

export default async function BrandsPage() {
  const brands = await getBrands();
  const counts = countProductsByBrand();

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Store directory"
        title={['The aisles']}
        intro="Every house has its own aisle. Step into one to see its signatures, or wander from aisle to aisle like you would in the shop."
      />
      <ul className={styles.grid}>
        {brands.map((brand, index) => (
          <li
            key={brand.slug}
            className="reveal"
            style={{ '--reveal-delay': `${(index % 3) * 6}%` } as CSSProperties}
          >
            <AisleCard
              brand={brand}
              aisle={getAisleNumber(brand.slug)}
              productCount={counts[brand.slug] ?? 0}
            />
          </li>
        ))}
      </ul>
    </PageTransition>
  );
}
