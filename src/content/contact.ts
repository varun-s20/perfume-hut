import hall from '@/assets/images/store/hall.jpg';
import { siteConfig } from '@/lib/site';

export const contactTopics = [
  'Find a fragrance',
  'An order',
  'Reserve a bottle',
  'Wholesale & partnerships',
  'Something else',
] as const;

export const contact = {
  title: ['Talk to', 'an advisor'],
  intro:
    'Looking for a signature, chasing a bottle that’s sold out everywhere, or want to reserve something before checkout opens? Tell us — a real person reads every message.',
  email: siteConfig.email,
  image: { src: hall, alt: 'The warm, chandelier-lit hall of a boutique' },
} as const;
