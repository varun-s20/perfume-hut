import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type CSSProperties, ViewTransition } from 'react';
import { ArrowRightIcon, ParcelIcon, ReturnIcon, SealIcon } from '@/components/icons';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductMedia } from '@/components/product/ProductMedia';
import { ProductPurchase } from '@/components/product/ProductPurchase';
import { JsonLd } from '@/components/seo/JsonLd';
import { Accordion } from '@/components/ui/Accordion';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { PageTransition } from '@/components/ui/PageTransition';
import { shippingPolicy } from '@/content/help';
import { audienceNotes, concentrationNotes, familyNotes, productPage } from '@/content/product';
import { brandHref, routes } from '@/content/routes';
import { bottleSpecs, fallbackBottle } from '@/data/bottles';
import {
  getAisleNumber,
  getBrand,
  getProduct,
  getProducts,
  getRelatedProducts,
} from '@/lib/catalog';
import { audienceLabels, familyLabels } from '@/lib/catalog-types';
import { cx } from '@/lib/cx';
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

const assuranceIcons = { seal: SealIcon, box: ParcelIcon, return: ReturnIcon };

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const brand = await getBrand(product.brandSlug);
  if (!brand) notFound();
  const related = await getRelatedProducts(product, 4);
  const aisle = getAisleNumber(brand.slug);
  const strength = concentrationNotes[product.concentration];
  const { unfolds, character, house } = productPage;

  const shipping = shippingPolicy.filter((section) =>
    ['Processing', 'Returns'].includes(section.title),
  );

  return (
    <PageTransition>
      <JsonLd data={buildProductJsonLd(product, brand)} />

      {/* ---------- The bottle, and everything you need to buy it ---------- */}
      <div className={styles.hero}>
        <div className={styles.stage}>
          <ProductMedia
            spec={bottleSpecs[product.slug] ?? fallbackBottle}
            name={`${brand.name} ${product.name}`}
            badge={product.bestseller ? 'Bestseller' : undefined}
            photo={
              <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
                <Image
                  src={product.image}
                  alt={product.imageAlt}
                  fill
                  sizes="(max-width: 959px) 100vw, 54vw"
                  placeholder="blur"
                  loading="eager"
                  fetchPriority="high"
                  className={styles.image}
                  style={{ objectPosition: product.imagePosition }}
                />
              </ViewTransition>
            }
          />
        </div>

        <div className={styles.info}>
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

          <p className={styles.house}>
            <Link href={brandHref(brand.slug)} transitionTypes={['walk-in']}>
              {brand.name}
            </Link>
            <span className={styles.dot} aria-hidden="true" />
            <span>{productPage.aisle(aisle)}</span>
          </p>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.concentration}>{product.concentration}</p>
          <ul className={styles.chips} aria-label="Character">
            <li>{audienceLabels[product.audience]}</li>
            <li>{familyLabels[product.family]}</li>
          </ul>
          <p className={styles.description}>{product.description}</p>

          <dl className={styles.glance} aria-label={productPage.glance}>
            {unfolds.tiers.map((tier) => (
              <div key={tier.key}>
                <dt>{tier.label}</dt>
                <dd>{product.notes[tier.key].slice(0, 3).join(', ')}</dd>
              </div>
            ))}
          </dl>

          <ProductPurchase
            slug={product.slug}
            name={product.name}
            sizes={product.sizes}
            inStock={product.availability === 'InStock'}
          />

          <ul className={styles.assurances}>
            {productPage.assurances.map(({ icon, text }) => {
              const Icon = assuranceIcons[icon];
              return (
                <li key={text}>
                  <Icon className={styles.assuranceIcon} />
                  {text}
                </li>
              );
            })}
          </ul>

          <p className={styles.advisor}>
            {productPage.advisor.lead}{' '}
            <Link href={routes.contact}>
              {productPage.advisor.label}
              <ArrowRightIcon className={styles.advisorArrow} />
            </Link>
          </p>
        </div>
      </div>

      {/* ---------- How it unfolds: the notes over time ---------- */}
      <section className={styles.unfolds} aria-labelledby="unfolds-heading">
        <div className={styles.unfoldsHead}>
          <p className={styles.eyebrowLight}>{unfolds.eyebrow}</p>
          <h2 id="unfolds-heading" className={styles.unfoldsTitle}>
            {unfolds.title}
          </h2>
        </div>
        <ol className={styles.timeline}>
          {unfolds.tiers.map((tier, index) => (
            <li
              key={tier.key}
              className={cx(styles.tier, 'reveal')}
              style={{ '--reveal-delay': `${index * 8}%` } as CSSProperties}
            >
              <span className={styles.tierMark} aria-hidden="true">
                <span className={styles.tierIndex}>{String(index + 1).padStart(2, '0')}</span>
              </span>
              <h3 className={styles.tierLabel}>{tier.label}</h3>
              <p className={styles.tierTiming}>{tier.timing}</p>
              <p className={styles.tierNotes}>{product.notes[tier.key].join(' · ')}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- The character ---------- */}
      <section className={styles.character} aria-labelledby="character-heading">
        <div className={styles.characterHead}>
          <p className={styles.eyebrow}>{character.eyebrow}</p>
          <h2 id="character-heading" className={styles.sectionTitle}>
            {character.title}
          </h2>
        </div>
        <dl className={styles.traits}>
          <div className={cx(styles.trait, 'reveal')}>
            <dt>{character.family}</dt>
            <dd className={styles.traitValue}>{familyLabels[product.family]}</dd>
            <dd className={styles.traitText}>{familyNotes[product.family]}</dd>
          </div>
          <div
            className={cx(styles.trait, 'reveal')}
            style={{ '--reveal-delay': '6%' } as CSSProperties}
          >
            <dt>{character.strength}</dt>
            <dd className={styles.traitValue}>{product.concentration}</dd>
            <dd
              className={styles.meter}
              role="img"
              aria-label={`Strength ${strength.strength} of 4`}
            >
              {[1, 2, 3, 4].map((step) => (
                <span key={step} data-on={step <= strength.strength || undefined} />
              ))}
            </dd>
            <dd className={styles.traitText}>{strength.text}</dd>
          </div>
          <div
            className={cx(styles.trait, 'reveal')}
            style={{ '--reveal-delay': '12%' } as CSSProperties}
          >
            <dt>{character.wearer}</dt>
            <dd className={styles.traitValue}>{audienceLabels[product.audience]}</dd>
            <dd className={styles.traitText}>{audienceNotes[product.audience]}</dd>
          </div>
        </dl>
      </section>

      {/* ---------- The house it comes from ---------- */}
      <section className={styles.houseBand} aria-labelledby="house-heading">
        <div className={cx(styles.houseMedia, 'reveal-clip')}>
          <Image
            src={brand.image}
            alt={brand.imageAlt}
            fill
            sizes="(max-width: 959px) 100vw, 50vw"
            placeholder="blur"
            className={styles.houseImage}
            style={{ objectPosition: brand.imagePosition }}
          />
        </div>
        <div className={cx(styles.houseBody, 'reveal')}>
          <p className={styles.eyebrow}>
            {house.eyebrow} · {productPage.aisle(aisle)}
          </p>
          <h2 id="house-heading" className={styles.houseTitle}>
            {brand.name}
          </h2>
          <p className={styles.houseTagline}>{brand.tagline}</p>
          <p className={styles.houseStory}>{brand.story}</p>
          <ButtonLink href={brandHref(brand.slug)} transitionTypes={['walk-in']}>
            {house.visit(brand.name)}
          </ButtonLink>
        </div>
      </section>

      {/* ---------- The details ---------- */}
      <section className={styles.details} aria-labelledby="details-heading">
        <h2 id="details-heading" className={styles.sectionTitle}>
          {productPage.details}
        </h2>
        <Accordion
          className={styles.accordion}
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
      </section>

      {related.length > 0 && (
        <section className={styles.related} aria-labelledby="related-heading">
          <h2 id="related-heading" className={styles.sectionTitle}>
            {productPage.related}
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </PageTransition>
  );
}
