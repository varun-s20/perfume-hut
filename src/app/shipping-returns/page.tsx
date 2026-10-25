import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { shippingPolicy } from '@/content/help';
import { routes } from '@/content/routes';
import { cx } from '@/lib/cx';
import styles from '../help.module.css';

export const metadata: Metadata = {
  title: 'Shipping & returns',
  description: 'How Perfume Hut packs, ships and handles returns for authentic designer fragrance.',
  alternates: { canonical: '/shipping-returns' },
};

export default function ShippingReturnsPage() {
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Help"
        title={['Shipping', '& returns']}
        intro={
          <>
            Questions about an order? <Link href={routes.contact}>Talk to an advisor</Link>.
          </>
        }
      />
      <div className={styles.body}>
        {shippingPolicy.map((section, index) => (
          <section key={section.title} className={cx(styles.policy, 'reveal')}>
            <span className={styles.policyIndex}>{String(index + 1).padStart(2, '0')}</span>
            <h2 className={styles.groupTitle}>{section.title}</h2>
            <p className={styles.policyBody}>{section.body}</p>
          </section>
        ))}
      </div>
    </PageTransition>
  );
}
