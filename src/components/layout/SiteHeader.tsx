import Link from 'next/link';
import { BagButton } from '@/components/cart/BagButton';
import { brandHref, productHref, routes, shopHref } from '@/content/routes';
import {
  getAisleNumber,
  getBrandName,
  getBrands,
  getProducts,
  getStartingPrice,
} from '@/lib/catalog';
import { cx } from '@/lib/cx';
import { formatMoney } from '@/lib/money';
import { searchText } from '@/lib/search';
import { HeaderSearch, type SearchEntry } from './HeaderSearch';
import { HeaderShell } from './HeaderShell';
import { type MenuHouse, MobileMenu } from './MobileMenu';
import styles from './SiteHeader.module.css';
import { ShopMenu } from './ShopMenu';

const collections = [
  { label: 'All fragrances', href: routes.shop },
  { label: 'For him', href: shopHref({ for: 'him' }) },
  { label: 'For her', href: shopHref({ for: 'her' }) },
  { label: 'Unisex', href: shopHref({ for: 'unisex' }) },
];

const searchSuggestions = ['Vanilla', 'Rose', 'Fresh', 'Dior', 'Chanel', 'For him'];

export async function SiteHeader() {
  const [allBrands, products] = await Promise.all([getBrands(), getProducts()]);
  const brands = allBrands.map((brand) => ({
    label: brand.name,
    href: brandHref(brand.slug),
  }));

  // The whole shelf is small enough to search in the browser as you type.
  const searchEntries: SearchEntry[] = products.map((product) => {
    const brand = getBrandName(product.brandSlug);
    return {
      slug: product.slug,
      href: productHref(product.slug),
      brand,
      name: product.name,
      concentration: product.concentration,
      price: formatMoney(getStartingPrice(product)),
      image: product.image,
      text: searchText(product, brand),
    };
  });

  // The phone menu shows every aisle in its own arched doorway.
  const houses: MenuHouse[] = allBrands.map((brand) => ({
    slug: brand.slug,
    name: brand.name,
    href: brandHref(brand.slug),
    aisle: getAisleNumber(brand.slug),
    image: brand.image,
    imagePosition: brand.imagePosition,
  }));

  const search = <HeaderSearch entries={searchEntries} suggestions={searchSuggestions} />;

  return (
    <HeaderShell className={styles.header}>
      <MobileMenu houses={houses} />

      <nav className={styles.primary} aria-label="Primary">
        <ShopMenu triggerClassName={styles.link} collections={collections} brands={brands} />
        <Link href={routes.brands} className={styles.link}>
          Brands
        </Link>
        {search}
      </nav>

      <Link href={routes.home} className={styles.logo} aria-label="Perfume Hut home">
        PH
      </Link>

      <nav className={styles.secondary} aria-label="Secondary">
        <Link href={routes.about} className={cx(styles.link, styles.desktopOnly)}>
          About
        </Link>
        <Link href={routes.contact} className={cx(styles.link, styles.desktopOnly)}>
          Contact
        </Link>
        {/* On phones the primary nav folds into the menu, so search sits by the bag. */}
        <div className={styles.mobileOnly}>{search}</div>
        <BagButton />
      </nav>
    </HeaderShell>
  );
}
