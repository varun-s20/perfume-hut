import type { Metadata } from 'next';
import Link from 'next/link';
import { Accordion } from '@/components/ui/Accordion';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { faq } from '@/content/help';
import { routes } from '@/content/routes';
import styles from '../help.module.css';

export const metadata: Metadata = {
  title: 'Frequently asked questions',
  description:
    'Authenticity, shipping, returns and live shopping — answers to the questions we hear most at Perfume Hut.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Help"
        title={['Questions,', 'answered']}
        intro={
          <>
            Can’t find what you need? <Link href={routes.contact}>Ask an advisor</Link>.
          </>
        }
      />
      <div className={styles.body}>
        {faq.map((group) => (
          <section key={group.title} className={styles.group}>
            <h2 className={styles.groupTitle}>{group.title}</h2>
            <Accordion
              items={group.items.map((item, index) => ({
                id: `${group.title}-${index}`,
                title: item.question,
                content: <p>{item.answer}</p>,
              }))}
            />
          </section>
        ))}
      </div>
    </PageTransition>
  );
}
