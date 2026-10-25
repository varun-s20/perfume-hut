import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Lines } from '@/components/ui/Lines';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { footer } from '@/content/footer';
import { routes } from '@/content/routes';
import { cx } from '@/lib/cx';
import { siteConfig } from '@/lib/site';
import { NewsletterForm } from './NewsletterForm';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  const { brand, linkGroups, newsletter, showcase } = footer;
  const [startImage, endImage] = showcase.images;
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <SectionIntro headingId="footer-heading" lines={footer.heading} />

      <div className={styles.columns}>
        <div>
          <h3 className={styles.title}>{brand.title}</h3>
          <p className={styles.text}>
            <Lines lines={brand.text} />
          </p>
        </div>

        {linkGroups.map((group) => (
          <nav key={group.name} aria-label={group.name}>
            <h3 className={styles.title}>{group.title}</h3>
            <ul className={styles.links}>
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                    <ArrowRightIcon className={styles.arrow} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className={styles.newsletter}>
          <h3 className={styles.title}>{newsletter.title}</h3>
          <p className={styles.text}>
            <Lines lines={newsletter.text} />
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className={styles.showcase}>
        <div className={cx(styles.showcaseMedia, 'reveal-clip')}>
          <Image
            src={startImage.src}
            alt={startImage.alt}
            sizes="(max-width: 959px) calc(50vw - 22px), min(30.7vw, 442px)"
            placeholder="blur"
            className={styles.showcaseImage}
          />
        </div>
        <div className={styles.showcaseBody}>
          <p className={cx(styles.showcaseText, 'reveal')}>
            <Lines lines={showcase.text} />
          </p>
          <ButtonLink href={showcase.cta.href} className={styles.showcaseCta}>
            {showcase.cta.label}
          </ButtonLink>
        </div>
        <div className={cx(styles.showcaseMedia, 'reveal-clip')}>
          <Image
            src={endImage.src}
            alt={endImage.alt}
            sizes="(max-width: 959px) calc(50vw - 22px), min(19.8vw, 285px)"
            placeholder="blur"
            className={styles.showcaseImage}
          />
        </div>
      </div>

      <p className={styles.copyright}>
        <Link href={routes.home}>
          © {year} {siteConfig.name} · {siteConfig.domain}
        </Link>
      </p>
    </footer>
  );
}
