import armani from '@/assets/images/brands/armani.jpg';
import calvinKlein from '@/assets/images/brands/calvin-klein.jpg';
import chanel from '@/assets/images/brands/chanel.jpg';
import dior from '@/assets/images/brands/dior.jpg';
import gucci from '@/assets/images/brands/gucci.jpg';
import prada from '@/assets/images/brands/prada.jpg';
import versace from '@/assets/images/brands/versace.jpg';
import ysl from '@/assets/images/brands/ysl.jpg';
import type { Brand } from '@/lib/catalog-types';

/** Aisle order in the store; it also drives prev/next aisle navigation. */
export const brands: readonly Brand[] = [
  {
    slug: 'versace',
    name: 'Versace',
    tagline: 'Mediterranean light, Medusa-bold.',
    story:
      'Gianni Versace built a house on unapologetic glamour, and the fragrances carry the same voltage — bright citrus, cool mint and a trail of vanilla that announces you before you arrive.',
    image: versace,
    imageAlt: 'Versace Eros bottle glowing against a dark, gold-flecked backdrop',
    imagePosition: '50% 68%',
  },
  {
    slug: 'gucci',
    name: 'Gucci',
    tagline: 'Romantic, eclectic, unmistakably Florentine.',
    story:
      'Under its creative directors Gucci treats perfume like a garden party with an edge: white florals, powdery iris and the occasional rule broken on purpose.',
    image: gucci,
    imageAlt: 'A lit display shelf lined with Gucci fragrance bottles',
    imagePosition: '50% 50%',
  },
  {
    slug: 'prada',
    name: 'Prada',
    tagline: 'Milanese minimalism with a technical edge.',
    story:
      'Prada fragrances are clean lines in liquid form — iris, ambergris and crisp citrus, engineered with the same precision as the runway.',
    image: prada,
    imageAlt: 'Gold Prada lettering on a fluted boutique wall',
    imagePosition: '50% 50%',
  },
  {
    slug: 'dior',
    name: 'Dior',
    tagline: 'Couture rigor from Avenue Montaigne.',
    story:
      'From the raw freshness of Sauvage to the rose-drenched Miss Dior, the house balances classic perfumery with scents that became modern signatures.',
    image: dior,
    imageAlt: 'Dior Sauvage on a pedestal framed by glowing light rings',
    imagePosition: '50% 55%',
  },
  {
    slug: 'chanel',
    name: 'Chanel',
    tagline: 'Timeless signatures since N°5.',
    story:
      'Few bottles are as recognisable as Chanel’s. Aldehydic florals, sparkling chypres and the woody freshness of Bleu — each one is a reference the rest of the industry measures against.',
    image: chanel,
    imageAlt: 'Chanel N°5 bottles displayed at a department-store counter',
    imagePosition: '50% 62%',
  },
  {
    slug: 'ysl',
    name: 'Yves Saint Laurent',
    tagline: 'Rebellious, sensual Parisian chic.',
    story:
      'YSL Beauty bottles the attitude of the couture house — the lavender-and-orange-blossom of Libre, the coffee-laced Black Opium and the after-dark spice of La Nuit.',
    image: ysl,
    imageAlt: 'YSL Libre bottle with its gold cassandre in dramatic low light',
    imagePosition: '50% 40%',
  },
  {
    slug: 'armani',
    name: 'Armani',
    tagline: 'Effortless Italian elegance.',
    story:
      'Giorgio Armani’s fragrances are quietly confident: the sea-spray freshness of Acqua di Giò and the warm, spiced chestnut of Stronger With You.',
    image: armani,
    imageAlt: 'Two black Acqua di Giò Profumo bottles side by side',
    imagePosition: '50% 45%',
  },
  {
    slug: 'calvin-klein',
    name: 'Calvin Klein',
    tagline: 'Clean, modern, made for everyone.',
    story:
      'Calvin Klein made fragrance democratic with CK One — a shared, citrus-clean scent that still feels current, alongside the romantic floral Eternity.',
    image: calvinKlein,
    imageAlt: 'A hand holding a CK One bottle in moody light',
    imagePosition: '50% 50%',
  },
];
