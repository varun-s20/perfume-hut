/*
 * Customer-facing policy copy. These are sensible starting points, NOT reviewed
 * policies: confirm shipping regions, timings and the returns window with the
 * business before launch.
 */

export type FaqItem = { question: string; answer: string };
export type FaqGroup = { title: string; items: readonly FaqItem[] };

export const faq: readonly FaqGroup[] = [
  {
    title: 'Authenticity',
    items: [
      {
        question: 'Are your fragrances authentic?',
        answer:
          'Yes. Every bottle comes through authorised distribution and arrives sealed in its original retail packaging. We never sell decants, refills or grey-market stock.',
      },
      {
        question: 'Do you sell testers?',
        answer:
          'No. Everything on our shelves is a full-size retail bottle with its box, exactly as you would buy it at a department-store counter.',
      },
      {
        question: 'A fragrance I love is sold out everywhere. Can you find it?',
        answer:
          'Often, yes — our supplier network reaches stock that has disappeared from other shops. Send us the name and size and we will let you know what we can source.',
      },
    ],
  },
  {
    title: 'Orders & shipping',
    items: [
      {
        question: 'When will my order ship?',
        answer:
          'Orders are packed by hand and usually leave us within one to two business days. You will receive tracking as soon as your parcel is on its way.',
      },
      {
        question: 'Where do you ship?',
        answer:
          'We currently ship within the United States. Fragrances are classed as limited-quantity hazardous goods, so international options are on the way once carriers are confirmed.',
      },
      {
        question: 'Do you sell on TikTok Shop and Whatnot?',
        answer:
          'Yes. Our live drops on TikTok Shop and Whatnot carry the same authentic stock as this store, often with show-only prices — follow us to catch the next one.',
      },
    ],
  },
  {
    title: 'Returns',
    items: [
      {
        question: 'Can I return a fragrance?',
        answer:
          'Unopened bottles in their original sealed packaging can be returned within 30 days of delivery. For hygiene reasons we cannot accept opened or used fragrances.',
      },
      {
        question: 'My bottle arrived damaged. What now?',
        answer:
          'We are sorry! Email us a photo within 48 hours of delivery and we will send a replacement or a full refund — no need to return the damaged item.',
      },
    ],
  },
];

export const shippingPolicy = [
  {
    title: 'Processing',
    body: 'Orders are packed by hand and usually dispatched within one to two business days. Orders placed on weekends or public holidays are processed the next business day.',
  },
  {
    title: 'Delivery',
    body: 'We ship within the United States with full tracking. Delivery typically takes three to seven business days after dispatch, depending on your location.',
  },
  {
    title: 'Returns',
    body: 'Unopened bottles in their original sealed packaging can be returned within 30 days of delivery for a refund to the original payment method. Opened or used fragrances cannot be returned for hygiene reasons.',
  },
  {
    title: 'Damaged or incorrect items',
    body: 'If anything arrives damaged or isn’t what you ordered, email a photo within 48 hours of delivery. We will replace it or refund you in full.',
  },
] as const;
