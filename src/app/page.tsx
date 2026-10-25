import { BrandMarquee } from '@/components/home/BrandMarquee';
import { Collection } from '@/components/home/Collection';
import { Features } from '@/components/home/Features';
import { Hero } from '@/components/home/Hero';
import { Notes } from '@/components/home/Notes';
import type { CabinetData } from '@/components/tour/cabinet-types';
import type { EntranceFrame } from '@/components/tour/Entrance';
import { StoreTour } from '@/components/tour/StoreTour';
import { PageTransition } from '@/components/ui/PageTransition';
import { bestsellers as bestsellerContent, tour } from '@/content/home';
import { bottleCutouts } from '@/data/bottles';
import { productHref } from '@/content/routes';
import {
  getAisleNumber,
  getBrandName,
  getBrands,
  getProducts,
  getProductsBySlugs,
  getStartingPrice,
} from '@/lib/catalog';
import { formatMoney } from '@/lib/money';

export default async function HomePage() {
  const [brands, products, bestsellers] = await Promise.all([
    getBrands(),
    getProducts(),
    getProductsBySlugs(bestsellerContent.slugs),
  ]);

  // The framed photographs at the door link to the bottles they show.
  const frames = tour.entrance.frames.flatMap(({ slug, image }): EntranceFrame[] => {
    const product = products.find((candidate) => candidate.slug === slug);
    if (!product) return [];
    return [
      {
        href: productHref(product.slug),
        brandName: getBrandName(product.brandSlug),
        name: product.name,
        concentration: product.concentration,
        image: image.src,
        alt: image.alt,
      },
    ];
  });

  // One cabinet per house, holding its bottles and what the floor says about them.
  const cabinets: CabinetData[] = brands.map((brand) => {
    const shelf = products.filter((product) => product.brandSlug === brand.slug);
    const lowest = shelf
      .map(getStartingPrice)
      .reduce((min, price) => (price.amount < min.amount ? price : min));
    return {
      slug: brand.slug,
      name: brand.name,
      tagline: brand.tagline,
      story: brand.story,
      number: getAisleNumber(brand.slug),
      fromPrice: formatMoney(lowest),
      bottles: shelf.map((product) => ({
        slug: product.slug,
        name: product.name,
        concentration: product.concentration,
        audience: product.audience,
        family: product.family,
        description: product.description,
        top: product.notes.top,
        base: product.notes.base,
        bestseller: Boolean(product.bestseller),
        href: productHref(product.slug),
        cutout: bottleCutouts[product.slug] ?? product.image,
        price: formatMoney(getStartingPrice(product)),
      })),
    };
  });

  const startingPrice = products
    .map(getStartingPrice)
    .reduce((lowest, price) => (price.amount < lowest.amount ? price : lowest));

  return (
    <PageTransition>
      <Hero startingPrice={startingPrice} />
      <StoreTour frames={frames} cabinets={cabinets} />
      <BrandMarquee brands={brands} />
      <Features />
      <Notes />
      <Collection products={bestsellers} />
    </PageTransition>
  );
}
