import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { contact } from '@/content/contact';
import { ContactForm } from './ContactForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact an advisor',
  description:
    'Ask a Perfume Hut advisor to find a fragrance, source a sold-out bottle or reserve something before checkout opens.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <PageTransition>
      <PageHeader eyebrow="Contact" title={contact.title} intro={contact.intro} />
      <div className={styles.layout}>
        <ContactForm />
        <aside className={styles.aside}>
          <div className={styles.media}>
            <Image
              src={contact.image.src}
              alt={contact.image.alt}
              sizes="(max-width: 959px) 100vw, 36vw"
              placeholder="blur"
              className={styles.image}
            />
          </div>
          <p className={styles.label}>Prefer email?</p>
          <a href={`mailto:${contact.email}`} className={styles.email}>
            {contact.email}
          </a>
        </aside>
      </div>
    </PageTransition>
  );
}
