import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { EyebrowPill } from '@/components/ui/EyebrowPill';
import { Lines } from '@/components/ui/Lines';
import { productHref } from '@/content/routes';
import { stories } from '@/content/stories';
import { getBrandName, getProductsBySlugs, getStartingPrice } from '@/lib/catalog';
import { cx } from '@/lib/cx';
import { formatMoney } from '@/lib/money';
import { type ReelStory, StoryReel } from './StoryReel';
import styles from './VideoStories.module.css';

/**
 * Video feedback in place of written testimonials: short portrait films from
 * customers, playing quietly in a reel. Tap one to watch them full screen,
 * story by story, with the bottle they're talking about one tap from the bag.
 */
export async function VideoStories() {
  const products = await getProductsBySlugs(stories.items.map((story) => story.productSlug));
  const reel: ReelStory[] = stories.items.flatMap((story) => {
    const product = products.find((candidate) => candidate.slug === story.productSlug);
    if (!product) return [];
    return [
      {
        ...story,
        product: {
          slug: product.slug,
          href: productHref(product.slug),
          brand: getBrandName(product.brandSlug),
          name: product.name,
          concentration: product.concentration,
          price: formatMoney(getStartingPrice(product)),
          ml: product.sizes[0].ml,
          image: product.image,
          inStock: product.availability === 'InStock',
        },
      },
    ];
  });

  return (
    <section className={styles.section} aria-labelledby="stories-heading">
      <header className={styles.head}>
        <div className="reveal">
          <EyebrowPill label={stories.eyebrow} />
          <h2 id="stories-heading" className={styles.heading}>
            <Lines lines={stories.heading} breaks="always" />
          </h2>
        </div>
        <div className={cx(styles.aside, 'reveal')}>
          <p className={styles.lede}>{stories.lede}</p>
          <Link href={stories.share.href} className={styles.share}>
            {stories.share.label}
            <ArrowRightIcon className={styles.shareArrow} />
          </Link>
        </div>
      </header>

      <StoryReel stories={reel} />
    </section>
  );
}
