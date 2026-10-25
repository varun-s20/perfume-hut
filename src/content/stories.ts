import type { StaticImageData } from 'next/image';
import firstSpray from '@/assets/images/stories/first-spray.jpg';
import neckSpray from '@/assets/images/stories/neck-spray.jpg';
import review from '@/assets/images/stories/review.jpg';
import smile from '@/assets/images/stories/smile.jpg';
import wrist from '@/assets/images/stories/wrist.jpg';
import { routes } from './routes';

/*
 * Video feedback from customers.
 *
 * PLACEHOLDER: the films are stock footage (Pexels, see CREDITS.json) and the
 * names, cities and words are written for layout only. Replace every entry
 * with a real customer's own video and quote, with their consent, before
 * launch. Set `sound: true` on films that have a voice track.
 */

export type CustomerStory = {
  id: string;
  /** A film in /public, short and portrait (9:16). */
  video: string;
  poster: StaticImageData;
  /** Whether the film has sound worth turning on. */
  sound: boolean;
  name: string;
  place: string;
  /** What they said, as it appears over the film. */
  quote: string;
  /** The bottle they're talking about. */
  productSlug: string;
};

export const stories = {
  eyebrow: 'Customer stories',
  heading: ['Heard at', 'the counter.'],
  lede: 'Short films from the people who wear our bottles: what they chose, and why they came back for more.',
  share: { label: 'Share your story', href: routes.contact },
  watch: (name: string) => `Watch ${name}’s story`,
  viewer: {
    close: 'Close stories',
    previous: 'Previous story',
    next: 'Next story',
    sound: { on: 'Turn sound off', off: 'Turn sound on' },
    pause: 'Pause',
    play: 'Play',
    add: 'Add to bag',
    added: 'Added to bag',
    view: 'See the bottle',
  },
  items: [
    {
      id: 'marcus',
      video: '/videos/stories/neck-spray.mp4',
      poster: neckSpray,
      sound: false,
      name: 'Marcus T.',
      place: 'Atlanta',
      quote:
        'Smelled it on a friend and found it here the same night. Sealed in the box, exactly like the counter.',
      productSlug: 'dior-sauvage-eau-de-parfum',
    },
    {
      id: 'elena',
      video: '/videos/stories/first-spray.mp4',
      poster: firstSpray,
      sound: false,
      name: 'Elena R.',
      place: 'Miami',
      quote:
        'The bottle I’ve worn for years, and it arrived wrapped like a present. I laughed opening it.',
      productSlug: 'chanel-no5-eau-de-parfum',
    },
    {
      id: 'hana',
      video: '/videos/stories/wrist.mp4',
      poster: wrist,
      sound: false,
      name: 'Hana K.',
      place: 'San Jose',
      quote:
        'I asked for floral but not sweet. They pointed me to Bloom, and I haven’t worn anything else since.',
      productSlug: 'gucci-bloom',
    },
    {
      id: 'jordan',
      video: '/videos/stories/review.mp4',
      poster: review,
      sound: false,
      name: 'Jordan L.',
      place: 'Chicago',
      quote:
        'Bought it in a live show on Tuesday, wore it on Thursday. Eros, sealed, just as they showed it.',
      productSlug: 'versace-eros-eau-de-toilette',
    },
    {
      id: 'grace',
      video: '/videos/stories/smile.mp4',
      poster: smile,
      sound: false,
      name: 'Grace M.',
      place: 'Austin',
      quote:
        'Every counter in town was sold out of Coco Mademoiselle. Perfume Hut had it, and it was real.',
      productSlug: 'chanel-coco-mademoiselle',
    },
  ],
} as const satisfies {
  heading: readonly string[];
  items: readonly CustomerStory[];
} & Record<string, unknown>;
