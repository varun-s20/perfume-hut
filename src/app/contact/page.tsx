import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { EyebrowPill } from '@/components/ui/EyebrowPill';
import { Lines } from '@/components/ui/Lines';
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
      {/*
       * Desktop: an arched doorway on the left runs from the eyebrow to the foot
       * of the form, and both stand on one brass floor line.
       * Mobile: a small doorway sits beside the email address, then the form.
       */}
      <div className={styles.layout}>
        <header className={styles.header}>
          <EyebrowPill label={contact.eyebrow} />
          <h1 className={styles.title}>
            <Lines lines={contact.title} />
          </h1>
          <p className={styles.intro}>{contact.intro}</p>
        </header>

        <div className={styles.arch}>
          <div className={styles.archPhoto}>
            <Image
              src={contact.image.src}
              alt={contact.image.alt}
              fill
              sizes="(max-width: 959px) 132px, 38vw"
              placeholder="blur"
              loading="eager"
              className={styles.archImage}
            />
          </div>
        </div>

        <p className={styles.emailCell}>
          <span className={styles.emailLabel}>{contact.emailLabel}</span>{' '}
          <a href={`mailto:${contact.email}`} className={styles.email}>
            {contact.email}
          </a>
        </p>

        <div className={styles.formCell}>
          <ContactForm />
        </div>

        <div className={styles.ways}>
          <section className={styles.way} aria-labelledby="contact-live">
            <h2 id="contact-live" className={styles.wayTitle}>
              {contact.live.title}
            </h2>
            <p className={styles.wayText}>{contact.live.body}</p>
          </section>

          <nav className={styles.way} aria-labelledby="contact-help">
            <h2 id="contact-help" className={styles.wayTitle}>
              {contact.help.title}
            </h2>
            <ul className={styles.wayLinks}>
              {contact.help.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.wayLink}>
                    {link.label}
                    <ArrowRightIcon className={styles.wayArrow} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </PageTransition>
  );
}
