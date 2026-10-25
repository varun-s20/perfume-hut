import bottleSunlight from '@/assets/images/about/bottle-sunlight.jpg';
import counterHeritage from '@/assets/images/about/counter-heritage.jpg';
import counterMarble from '@/assets/images/about/counter-marble.jpg';
import discoveryVials from '@/assets/images/about/discovery-vials.jpg';
import wrappingTwine from '@/assets/images/about/wrapping-twine.jpg';

/*
 * Story copy draws on the owners' background in fragrance retail. Confirm the
 * specific claims (years, store count) with the business before launch.
 */
export const about = {
  eyebrow: 'Our story',
  title: ['A fragrance store,', 'not a warehouse.'],
  intro:
    'Perfume Hut started behind real fragrance counters. After years of helping people find their signature in stores, we built the shop we always wanted to send them to: every bottle authentic, every aisle curated, and someone on hand who actually knows the difference between a top note and a dry-down.',
  hero: {
    src: counterHeritage,
    alt: 'A heritage fragrance counter: walnut cabinets, gold-capped testers and porcelain scent funnels',
  },
  promises: {
    eyebrow: 'What we stand for',
    heading: ['The counter,', 'brought home.'],
    items: [
      {
        title: 'Authentic, without exception',
        body: 'Everything we sell is sealed, full-size and sourced through authorised distribution. If we would not spray it on ourselves, it does not go on the shelf.',
        image: {
          src: bottleSunlight,
          alt: 'A square bottle of amber perfume resting on linen in low sunlight',
        },
      },
      {
        title: 'Curated like a counter, not a catalogue',
        body: 'We stock the houses people ask for by name — Dior, Chanel, Versace, YSL and more — and the signatures within them that keep earning their place.',
        image: {
          src: counterMarble,
          alt: 'A marble fragrance counter lined with amber tester bottles and quartz crystals',
        },
      },
      {
        title: 'Advice that remembers you',
        body: 'Tell us what you wear and what you love, and we will steer you to the next bottle — in the store, in our live shows, or by email.',
        image: {
          src: discoveryVials,
          alt: 'Discovery vials and illustrated scent cards laid out on a fragrance counter',
        },
      },
    ],
  },
  journey: {
    eyebrow: 'From our shelf to your door',
    heading: ['How an order', 'reaches you.'],
    image: {
      src: wrappingTwine,
      alt: 'Hands tying twine around a linen-covered gift box on a dark wooden table',
    },
    steps: [
      {
        title: 'Sourced',
        body: 'Only through authorised distribution. Never grey-market stock, decants or refills.',
      },
      {
        title: 'Checked',
        body: 'Every bottle is full-size and sealed in its original retail box before it is packed.',
      },
      {
        title: 'Wrapped by hand',
        body: 'Packed with care, so it reaches you exactly as it left the counter.',
      },
      {
        title: 'Tracked',
        body: 'Tracking comes to you as soon as your parcel is on its way.',
      },
    ],
  },
  closing: {
    eyebrow: 'Come in',
    title: ['The doors are open.', 'Come in and look around.'],
    tour: 'Take the store tour',
    live: 'Also live on Whatnot and TikTok Shop, with the same authentic stock as the store.',
  },
} as const;
