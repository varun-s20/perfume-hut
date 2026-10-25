import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EyebrowPill } from '@/components/ui/EyebrowPill';
import { routes } from '@/content/routes';
import styles from './status-page.module.css';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className={styles.status} aria-labelledby="not-found-title">
      <EyebrowPill label="404" />
      <h1 id="not-found-title" className={styles.title}>
        This aisle doesn’t exist
      </h1>
      <p className={styles.text}>The page you’re looking for has moved or never stocked here.</p>
      <ButtonLink href={routes.brands}>Walk the aisles</ButtonLink>
    </section>
  );
}
