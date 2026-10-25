import Link from 'next/link';
import { BagButton } from '@/components/cart/BagButton';
import { SearchIcon } from '@/components/icons';
import { brandHref, routes, shopHref } from '@/content/routes';
import { getBrands } from '@/lib/catalog';
import { cx } from '@/lib/cx';
import { MobileMenu } from './MobileMenu';
import styles from './SiteHeader.module.css';
import { ShopMenu } from './ShopMenu';

const collections = [
  { label: 'All fragrances', href: routes.shop },
  { label: 'For him', href: shopHref({ for: 'him' }) },
  { label: 'For her', href: shopHref({ for: 'her' }) },
  { label: 'Unisex', href: shopHref({ for: 'unisex' }) },
];

export async function SiteHeader() {
  const brands = (await getBrands()).map((brand) => ({
    label: brand.name,
    href: brandHref(brand.slug),
  }));

  const mobileLinks = [
    { label: 'Shop all', href: routes.shop },
    { label: 'Brands', href: routes.brands },
    { label: 'Search', href: routes.search },
    { label: 'About', href: routes.about },
    { label: 'Contact', href: routes.contact },
    { label: 'FAQ', href: routes.faq },
  ];

  return (
    <header className={styles.header}>
      <MobileMenu links={mobileLinks} />

      <nav className={styles.primary} aria-label="Primary">
        <ShopMenu triggerClassName={styles.link} collections={collections} brands={brands} />
        <Link href={routes.brands} className={styles.link}>
          Brands
        </Link>
        <Link href={routes.search} className={styles.link}>
          Search
          <SearchIcon className={styles.searchIcon} />
        </Link>
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
        <BagButton />
      </nav>
    </header>
  );
}
