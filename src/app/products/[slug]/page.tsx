import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ViewTransition } from 'react';
import { NotesPyramid } from '@/components/product/NotesPyramid';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductPurchase } from '@/components/product/ProductPurchase';
import { JsonLd } from '@/components/seo/JsonLd';
import { Accordion } from '@/components/ui/Accordion';
import { PageTransition } from '@/components/ui/PageTransition';
import { shippingPolicy } from '@/content/help';
import { brandHref, routes } from '@/content/routes';
import { getBrand, getProduct, getProducts, getRelatedProducts } from '@/lib/catalog';
import { audienceLabels, familyLabels } from '@/lib/catalog-types';
import { buildProductJsonLd } from '@/lib/structured-data';
import styles from './page.module.css';

type ProductPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  const brand = await getBrand(product.brandSlug);
  const title = `${brand?.name ?? ''} ${product.name} ${product.concentration}`.trim();
  return {
    title,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      images: [
        {
          url: product.image.src,
          width: product.image.width,
          height: product.image.height,
          alt: product.imageAlt,
        },
      ],
    },
  };
}

const assurances = [
  'Authentic, sealed retail bottle',
  'Packed by hand, tracked to your door',
  'Returns on unopened bottles within 30 days',
];

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const brand = await getBrand(product.brandSlug);
  if (!brand) notFound();
  const related = await getRelatedProducts(product, 4);

  const shipping = shippingPolicy.filter((section) =>
    ['Processing', 'Returns'].includes(section.title),
  );

  return (
    <PageTransition>
      <JsonLd data={buildProductJsonLd(product, brand)} />

      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href={routes.shop} transitionTypes={['nav-back']}>
              Shop
            </Link>
          </li>
          <li>
            <Link href={brandHref(brand.slug)} transitionTypes={['nav-back']}>
              {brand.name}
            </Link>
          </li>
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className={styles.hero}>
        <div className={styles.media}>
          <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
            <Image
              src={product.image}
              alt={product.imageAlt}
              sizes="(max-width: 959px) 100vw, min(48vw, 690px)"
              placeholder="blur"
              loading="eager"
              fetchPriority="high"
              className={styles.image}
              style={{ objectPosition: product.imagePosition }}
            />
          </ViewTransition>
        </div>

        <div className={styles.info}>
          <Link href={brandHref(brand.slug)} className={styles.brand}>
            {brand.name}
          </Link>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.meta}>
            {product.concentration} · {audienceLabels[product.audience]} ·{' '}
            {familyLabels[product.family]}
          </p>
          <p className={styles.description}>{product.description}</p>

          <ProductPurchase
            slug={product.slug}
            sizes={product.sizes}
            inStock={product.availability === 'InStock'}
          />

          <ul className={styles.assurances}>
            {assurances.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.sections}>
        <NotesPyramid notes={product.notes} />

        <Accordion
          className={styles.details}
          defaultOpen={['wear']}
          items={[
            {
              id: 'wear',
              title: 'How to wear it',
              content: (
                <p>
                  Spray onto pulse points — wrists, the base of the throat, behind the ears — from
                  about 15 cm away. Let it dry rather than rubbing it in, which flattens the top
                  notes. For a softer trail, mist once into the air and walk through it.
                </p>
              ),
            },
            {
              id: 'authenticity',
              title: 'Our authenticity promise',
              content: (
                <p>
                  Every {brand.name} bottle we sell comes through authorised distribution and ships
                  sealed in its original retail packaging. No testers, no decants, no grey-market
                  stock.
                </p>
              ),
            },
            {
              id: 'shipping',
              title: 'Shipping & returns',
              content: (
                <>
                  {shipping.map((section) => (
                    <p key={section.title}>{section.body}</p>
                  ))}
                  <p>
                    <Link href={routes.shipping}>Read the full policy</Link>
                  </p>
                </>
              ),
            },
          ]}
        />

        {related.length > 0 && (
          <section aria-labelledby="related-heading">
            <h2 id="related-heading" className={styles.relatedHeading}>
              You might also like
            </h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </PageTransition>
  );
}
