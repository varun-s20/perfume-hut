import waxSeal from '@/assets/images/contact/wax-seal.jpg';
import { routes } from '@/content/routes';
import { siteConfig } from '@/lib/site';

export const contactTopics = [
  'Find a fragrance',
  'An order',
  'Reserve a bottle',
  'Wholesale & partnerships',
  'Something else',
] as const;

export const contact = {
  eyebrow: 'Contact',
  title: ['Talk to', 'an advisor'],
  intro:
    'Looking for a signature, chasing a bottle that’s sold out everywhere, or want to reserve something before checkout opens? Tell us — a real person reads every message.',
  email: siteConfig.email,
  emailLabel: 'Prefer email?',
  image: { src: waxSeal, alt: 'Hands pressing a brass wax seal onto a white envelope' },
  live: {
    title: 'Live shows',
    body: 'Catch our live drops on Whatnot and TikTok Shop, with the same authentic stock as the store.',
  },
  help: {
    title: 'Before you write',
    links: [
      { label: 'FAQ', href: routes.faq },
      { label: 'Shipping & returns', href: routes.shipping },
    ],
  },
} as const;
