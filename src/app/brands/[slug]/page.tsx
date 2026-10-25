import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AisleNav } from '@/components/brand/AisleNav';
import { BrandHero } from '@/components/brand/BrandHero';
import { ProductGrid } from '@/components/product/ProductGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageTransition } from '@/components/ui/PageTransition';
import {
  getAdjacentBrands,
  getAisleNumber,
  getBrand,
  getBrands,
  getProductsByBrand,
} from '@/lib/catalog';
import { buildItemListJsonLd } from '@/lib/structured-data';
import styles from './page.module.css';

type BrandPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getBrands()).map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const brand = await getBrand((await params).slug);
  if (!brand) return {};
  return {
    title: `${brand.name} fragrances`,
    description: `${brand.tagline} Shop authentic ${brand.name} perfume and cologne at Perfume Hut.`,
    alternates: { canonical: `/brands/${brand.slug}` },
    openGraph: {
      images: [
        {
          url: brand.image.src,
          width: brand.image.width,
          height: brand.image.height,
          alt: brand.imageAlt,
        },
      ],
    },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const products = await getProductsByBrand(brand.slug);
  const { previous, next } = getAdjacentBrands(brand.slug);

  return (
    <PageTransition>
      <JsonLd
        data={buildItemListJsonLd(
          `${brand.name} fragrances`,
          products,
          new Map([[brand.slug, brand.name]]),
        )}
      />
      <BrandHero brand={brand} aisle={getAisleNumber(brand.slug)} productCount={products.length} />

      <section className={styles.story} aria-label={`About ${brand.name}`}>
        <p className="reveal">{brand.story}</p>
      </section>

      <section className={styles.shelf} aria-label={`${brand.name} fragrances`}>
        <ProductGrid products={products} eagerCount={4} />
      </section>

      <AisleNav previous={previous} next={next} />
    </PageTransition>
  );
}
