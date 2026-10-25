import lab from '@/assets/images/editorial/lab.jpg';
import perfumery from '@/assets/images/editorial/perfumery.jpg';
import cage from '@/assets/images/store/cage.jpg';
import hall from '@/assets/images/store/hall.jpg';
import organ from '@/assets/images/store/organ.jpg';

/*
 * Story copy draws on the owners' background in fragrance retail. Confirm the
 * specific claims (years, store count) with the business before launch.
 */
export const about = {
  title: ['A fragrance store,', 'not a warehouse.'],
  intro:
    'Perfume Hut started behind real fragrance counters. After years of helping people find their signature in stores, we built the shop we always wanted to send them to: every bottle authentic, every aisle curated, and someone on hand who actually knows the difference between a top note and a dry-down.',
  hero: { src: hall, alt: 'A warmly lit boutique hall with a crystal chandelier' },
  chapters: [
    {
      title: 'Authentic, without exception',
      body: 'Everything we sell is sealed, full-size and sourced through authorised distribution. If we would not spray it on ourselves, it does not go on the shelf.',
      image: { src: perfumery, alt: 'Shelves of perfume bottles and raw materials' },
    },
    {
      title: 'Curated like a counter, not a catalogue',
      body: 'We stock the houses people ask for by name — Dior, Chanel, Versace, YSL and more — and the signatures within them that keep earning their place.',
      image: { src: organ, alt: 'A curved perfume organ lined with bottles' },
    },
    {
      title: 'Advice that remembers you',
      body: 'Tell us what you wear and what you love, and we will steer you to the next bottle — in the store, in our live shows, or by email.',
      image: { src: cage, alt: 'Designer fragrances displayed inside a gilded birdcage' },
    },
  ],
  closing: { src: lab, alt: 'A perfumer’s workbench with glassware and a scale' },
} as const;
