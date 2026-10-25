import type { Route } from 'next';
import type { StaticImageData } from 'next/image';

/** A customer film, with the bottle it's about (see content/stories.ts). */
export type ReelStory = {
  id: string;
  video: string;
  poster: StaticImageData;
  sound: boolean;
  name: string;
  place: string;
  quote: string;
  product: {
    slug: string;
    href: Route;
    brand: string;
    name: string;
    concentration: string;
    price: string;
    ml: number;
    image: StaticImageData;
    inStock: boolean;
  };
};

export function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M8 5.4v13.2c0 .8.9 1.3 1.6.9l10.4-6.6c.6-.4.6-1.3 0-1.7L9.6 4.6C8.9 4.1 8 4.6 8 5.4z" />
    </svg>
  );
}
