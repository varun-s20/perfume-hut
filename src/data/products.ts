import armaniAcquaDiGio from '@/assets/images/products/armani-acqua-di-gio.jpg';
import armaniAcquaDiGioEdp from '@/assets/images/products/armani-acqua-di-gio-edp.jpg';
import armaniStrongerWithYou from '@/assets/images/products/armani-stronger-with-you.jpg';
import chanelBleu from '@/assets/images/products/chanel-bleu.jpg';
import chanelChance from '@/assets/images/products/chanel-chance-eau-tendre.jpg';
import chanelCocoMademoiselle from '@/assets/images/products/chanel-coco-mademoiselle.jpg';
import chanelGabrielle from '@/assets/images/products/chanel-gabrielle.jpg';
import chanelNo5 from '@/assets/images/products/chanel-no5.jpg';
import ckAll from '@/assets/images/products/ck-all.jpg';
import ckEternity from '@/assets/images/products/ck-eternity.jpg';
import ckOne from '@/assets/images/products/ck-one.jpg';
import diorBloomingBouquet from '@/assets/images/products/dior-blooming-bouquet.jpg';
import diorMissDior from '@/assets/images/products/dior-miss-dior.jpg';
import diorSauvage from '@/assets/images/products/dior-sauvage.jpg';
import gucciBloom from '@/assets/images/products/gucci-bloom.jpg';
import gucciGuilty from '@/assets/images/products/gucci-guilty-pour-femme.jpg';
import gucciMemoire from '@/assets/images/products/gucci-memoire.jpg';
import pradaCandy from '@/assets/images/products/prada-candy.jpg';
import pradaLHomme from '@/assets/images/products/prada-lhomme.jpg';
import pradaLunaRossaBlack from '@/assets/images/products/prada-luna-rossa-black.jpg';
import versaceCrystalNoir from '@/assets/images/products/versace-crystal-noir.jpg';
import versaceDylanBlue from '@/assets/images/products/versace-dylan-blue.jpg';
import versaceErosEdp from '@/assets/images/products/versace-eros-edp.jpg';
import versaceErosEdt from '@/assets/images/products/versace-eros-edt.jpg';
import yslBlackOpium from '@/assets/images/products/ysl-black-opium.jpg';
import yslLaNuit from '@/assets/images/products/ysl-la-nuit.jpg';
import yslLibre from '@/assets/images/products/ysl-libre.jpg';
import type { Product, ProductSize } from '@/lib/catalog-types';

/** Shorthand for a USD size. Amounts are whole dollars; stored as cents. */
const size = (ml: number, dollars: number): ProductSize => ({
  ml,
  price: { amount: dollars * 100, currency: 'USD' },
});

/**
 * Sample assortment. Prices are placeholders until the live inventory feed
 * (Whatnot / TikTok Shop) is connected.
 */
export const products: readonly Product[] = [
  // Versace
  {
    slug: 'versace-eros-eau-de-toilette',
    brandSlug: 'versace',
    name: 'Eros',
    concentration: 'Eau de Toilette',
    audience: 'him',
    family: 'aromatic',
    description:
      'A charge of fresh mint and green apple over creamy tonka and Madagascar vanilla. Confident, sweet and impossible to ignore.',
    notes: {
      top: ['Mint', 'Green apple', 'Lemon'],
      heart: ['Tonka bean', 'Ambroxan', 'Geranium'],
      base: ['Madagascar vanilla', 'Vetiver', 'Oakmoss', 'Cedarwood'],
    },
    sizes: [size(50, 82), size(100, 108)],
    availability: 'InStock',
    bestseller: true,
    image: versaceErosEdt,
    imageAlt: 'Turquoise Versace Eros eau de toilette bottle on a white plinth',
  },
  {
    slug: 'versace-eros-eau-de-parfum',
    brandSlug: 'versace',
    name: 'Eros',
    concentration: 'Eau de Parfum',
    audience: 'him',
    family: 'amber',
    description:
      'The richer, darker Eros: mint and citrus settle into sandalwood, leather and vanilla for a longer, warmer trail.',
    notes: {
      top: ['Mint', 'Lemon', 'Mandarin'],
      heart: ['Ambroxan', 'Clary sage', 'Geranium'],
      base: ['Vanilla', 'Sandalwood', 'Leather', 'Cedar'],
    },
    sizes: [size(50, 95), size(100, 124)],
    availability: 'InStock',
    image: versaceErosEdp,
    imageAlt: 'Versace Eros eau de parfum beside a magenta rose',
    imagePosition: '62% 50%',
  },
  {
    slug: 'versace-dylan-blue',
    brandSlug: 'versace',
    name: 'Dylan Blue',
    concentration: 'Eau de Toilette',
    audience: 'him',
    family: 'fresh',
    description:
      'Calabrian bergamot and grapefruit meet fig leaves and black pepper, drying down to musk and incense. Modern Mediterranean freshness.',
    notes: {
      top: ['Bergamot', 'Grapefruit', 'Fig leaves'],
      heart: ['Violet leaf', 'Papyrus', 'Black pepper'],
      base: ['Musk', 'Tonka bean', 'Saffron', 'Incense'],
    },
    sizes: [size(50, 78), size(100, 102)],
    availability: 'InStock',
    image: versaceDylanBlue,
    imageAlt: 'Cobalt Versace Dylan Blue bottle resting on dark stones',
  },
  {
    slug: 'versace-crystal-noir',
    brandSlug: 'versace',
    name: 'Crystal Noir',
    concentration: 'Eau de Toilette',
    audience: 'her',
    family: 'amber',
    description:
      'Ginger and cardamom open onto creamy gardenia and coconut before a sandalwood and amber base. Mysterious and velvety.',
    notes: {
      top: ['Ginger', 'Cardamom', 'Pepper'],
      heart: ['Gardenia', 'Coconut', 'Orange blossom', 'Peony'],
      base: ['Sandalwood', 'Musk', 'Amber'],
    },
    sizes: [size(50, 80), size(90, 105)],
    availability: 'InStock',
    image: versaceCrystalNoir,
    imageAlt: 'Faceted black Versace Crystal Noir bottle beside its box',
    imagePosition: '35% 50%',
  },

  // Gucci
  {
    slug: 'gucci-bloom',
    brandSlug: 'gucci',
    name: 'Bloom',
    concentration: 'Eau de Parfum',
    audience: 'her',
    family: 'floral',
    description:
      'A thriving garden of white flowers — natural tuberose and jasmine with the rare Rangoon creeper. Full, rich and unmistakably floral.',
    notes: {
      top: ['Rangoon creeper'],
      heart: ['Jasmine sambac', 'Tuberose'],
      base: ['Orris root', 'Sandalwood'],
    },
    sizes: [size(50, 118), size(100, 158)],
    availability: 'InStock',
    image: gucciBloom,
    imageAlt: 'Blush-pink Gucci Bloom bottle against a white backdrop',
  },
  {
    slug: 'gucci-guilty-pour-femme',
    brandSlug: 'gucci',
    name: 'Guilty Pour Femme',
    concentration: 'Eau de Parfum',
    audience: 'her',
    family: 'floral',
    description:
      'Pink pepper and mandarin lead into lilac and rose over patchouli and amber. Provocative, polished and made to be noticed.',
    notes: {
      top: ['Pink pepper', 'Mandarin'],
      heart: ['Lilac', 'Rose', 'Geranium'],
      base: ['Patchouli', 'Amber', 'Cedar'],
    },
    sizes: [size(50, 112), size(90, 148)],
    availability: 'InStock',
    image: gucciGuilty,
    imageAlt: 'Gold Gucci Guilty Pour Femme bottle with its interlocking-G plaque',
  },
  {
    slug: 'gucci-memoire-dune-odeur',
    brandSlug: 'gucci',
    name: 'Mémoire d’une Odeur',
    concentration: 'Eau de Parfum',
    audience: 'unisex',
    family: 'aromatic',
    description:
      'Roman chamomile and bitter almond drift over jasmine and warm musks — an herbal, nostalgic scent built to be shared.',
    notes: {
      top: ['Roman chamomile', 'Bitter almond'],
      heart: ['Indian jasmine'],
      base: ['Musk', 'Cedar', 'Sandalwood', 'Vanilla'],
    },
    sizes: [size(60, 98), size(100, 135)],
    availability: 'InStock',
    image: gucciMemoire,
    imageAlt: 'Green fluted Gucci Mémoire d’une Odeur bottle beside vintage glassware',
    imagePosition: '60% 50%',
  },

  // Prada
  {
    slug: 'prada-luna-rossa-black',
    brandSlug: 'prada',
    name: 'Luna Rossa Black',
    concentration: 'Eau de Parfum',
    audience: 'him',
    family: 'amber',
    description:
      'Bergamot brightens a dark core of patchouli, ambrette and amberwood. Sleek, sensual and engineered for evening.',
    notes: {
      top: ['Bergamot'],
      heart: ['Patchouli', 'Angelica'],
      base: ['Ambrette', 'Coumarin', 'Amberwood', 'Musk'],
    },
    sizes: [size(50, 96), size(100, 132)],
    availability: 'InStock',
    image: pradaLunaRossaBlack,
    imageAlt: 'Black Prada Luna Rossa bottle with its red stripe on a sunlit wooden desk',
  },
  {
    slug: 'prada-lhomme',
    brandSlug: 'prada',
    name: 'L’Homme',
    concentration: 'Eau de Toilette',
    audience: 'him',
    family: 'woody',
    description:
      'Neroli and black pepper over Prada’s signature iris, grounded in amber and cedar. Clean-cut, like a pressed white shirt.',
    notes: {
      top: ['Neroli', 'Black pepper', 'Cardamom'],
      heart: ['Iris', 'Violet', 'Geranium'],
      base: ['Amber', 'Patchouli', 'Cedar'],
    },
    sizes: [size(50, 98), size(100, 136)],
    availability: 'InStock',
    image: pradaLHomme,
    imageAlt: 'Clear Prada L’Homme bottle catching evening light',
  },
  {
    slug: 'prada-candy',
    brandSlug: 'prada',
    name: 'Candy',
    concentration: 'Eau de Parfum',
    audience: 'her',
    family: 'gourmand',
    description:
      'A playful gourmand of caramel and powdery musk wrapped in benzoin and vanilla. Sweet, but with Prada’s polish.',
    notes: {
      top: ['Caramel'],
      heart: ['Musk', 'Powdery notes'],
      base: ['Benzoin', 'Vanilla'],
    },
    sizes: [size(50, 102), size(80, 132)],
    availability: 'InStock',
    image: pradaCandy,
    imageAlt: 'Pink Prada Candy bottle beside a white silk flower',
    imagePosition: '68% 50%',
  },

  // Dior
  {
    slug: 'dior-sauvage-eau-de-parfum',
    brandSlug: 'dior',
    name: 'Sauvage',
    concentration: 'Eau de Parfum',
    audience: 'him',
    family: 'amber',
    description:
      'Juicy Calabrian bergamot meets Sichuan pepper and lavender, softened by a smoky vanilla. The modern signature our customers ask for most.',
    notes: {
      top: ['Calabrian bergamot'],
      heart: ['Sichuan pepper', 'Lavender', 'Star anise', 'Nutmeg'],
      base: ['Ambroxan', 'Vanilla'],
    },
    sizes: [size(60, 112), size(100, 148)],
    availability: 'InStock',
    bestseller: true,
    image: diorSauvage,
    imageAlt: 'Midnight-blue Dior Sauvage eau de parfum lit in electric blue',
  },
  {
    slug: 'dior-miss-dior-eau-de-parfum',
    brandSlug: 'dior',
    name: 'Miss Dior',
    concentration: 'Eau de Parfum',
    audience: 'her',
    family: 'floral',
    description:
      'A couture bouquet of Grasse rose, lily of the valley and iris on a soft vanilla-musk base. Romantic and endlessly elegant.',
    notes: {
      top: ['Lily of the valley', 'Peony'],
      heart: ['Grasse rose', 'Iris'],
      base: ['Vanilla', 'Musk', 'Tonka bean'],
    },
    sizes: [size(50, 128), size(100, 172)],
    availability: 'InStock',
    image: diorMissDior,
    imageAlt: 'Miss Dior bottle with its bow cap on teal satin',
  },
  {
    slug: 'dior-miss-dior-blooming-bouquet',
    brandSlug: 'dior',
    name: 'Miss Dior Blooming Bouquet',
    concentration: 'Eau de Toilette',
    audience: 'her',
    family: 'floral',
    description:
      'Sicilian mandarin lifts pink peony and Damask rose into a light, tender floral finished with white musk.',
    notes: {
      top: ['Sicilian mandarin'],
      heart: ['Pink peony', 'Damask rose'],
      base: ['White musk'],
    },
    sizes: [size(50, 110), size(100, 142)],
    availability: 'InStock',
    image: diorBloomingBouquet,
    imageAlt: 'Pale pink Miss Dior Blooming Bouquet bottle in soft tulle',
  },

  // Chanel
  {
    slug: 'chanel-no5-eau-de-parfum',
    brandSlug: 'chanel',
    name: 'N°5',
    concentration: 'Eau de Parfum',
    audience: 'her',
    family: 'floral',
    description:
      'The original abstract floral: sparkling aldehydes, May rose and jasmine over sandalwood and vanilla. A legend that never dates.',
    notes: {
      top: ['Aldehydes', 'Ylang-ylang', 'Neroli'],
      heart: ['May rose', 'Jasmine'],
      base: ['Sandalwood', 'Vanilla', 'Vetiver'],
    },
    sizes: [size(50, 150), size(100, 198)],
    availability: 'InStock',
    image: chanelNo5,
    imageAlt: 'Golden Chanel N°5 bottle on white linen',
  },
  {
    slug: 'chanel-coco-mademoiselle',
    brandSlug: 'chanel',
    name: 'Coco Mademoiselle',
    concentration: 'Eau de Parfum',
    audience: 'her',
    family: 'floral',
    description:
      'Sparkling orange and bergamot over rose and jasmine, with a sensual patchouli-vanilla trail. Bold, fresh and irresistibly modern.',
    notes: {
      top: ['Orange', 'Bergamot'],
      heart: ['Rose', 'Jasmine'],
      base: ['Patchouli', 'Vetiver', 'Vanilla', 'White musk'],
    },
    sizes: [size(50, 142), size(100, 185)],
    availability: 'InStock',
    bestseller: true,
    image: chanelCocoMademoiselle,
    imageAlt: 'Coco Mademoiselle bottle resting on rose satin',
  },
  {
    slug: 'bleu-de-chanel-eau-de-parfum',
    brandSlug: 'chanel',
    name: 'Bleu de Chanel',
    concentration: 'Eau de Parfum',
    audience: 'him',
    family: 'woody',
    description:
      'Citrus and mint over ginger and jasmine, deepening into incense, sandalwood and cedar. Refined freshness with real depth.',
    notes: {
      top: ['Grapefruit', 'Lemon', 'Mint'],
      heart: ['Ginger', 'Nutmeg', 'Jasmine'],
      base: ['Incense', 'Sandalwood', 'Cedar', 'Labdanum'],
    },
    sizes: [size(50, 132), size(100, 172)],
    availability: 'InStock',
    image: chanelBleu,
    imageAlt: 'Navy Bleu de Chanel bottle against a pale blue background',
  },
  {
    slug: 'chanel-chance-eau-tendre',
    brandSlug: 'chanel',
    name: 'Chance Eau Tendre',
    concentration: 'Eau de Toilette',
    audience: 'her',
    family: 'fresh',
    description:
      'Quince and grapefruit sparkle over jasmine and hyacinth, softened by white musk and iris. Light, luminous and easy to love.',
    notes: {
      top: ['Quince', 'Grapefruit'],
      heart: ['Jasmine', 'Hyacinth'],
      base: ['White musk', 'Iris', 'Cedar'],
    },
    sizes: [size(50, 118), size(100, 150)],
    availability: 'InStock',
    image: chanelChance,
    imageAlt: 'Round Chanel Chance Eau Tendre bottle in front of pale roses',
  },
  {
    slug: 'chanel-gabrielle',
    brandSlug: 'chanel',
    name: 'Gabrielle',
    concentration: 'Eau de Parfum',
    audience: 'her',
    family: 'floral',
    description:
      'A radiant bouquet of jasmine, tuberose, orange blossom and ylang-ylang built around light. Solar, airy and quietly confident.',
    notes: {
      top: ['Mandarin', 'Grapefruit'],
      heart: ['Jasmine', 'Tuberose', 'Orange blossom', 'Ylang-ylang'],
      base: ['Sandalwood', 'Musk'],
    },
    sizes: [size(50, 136), size(100, 178)],
    availability: 'InStock',
    image: chanelGabrielle,
    imageAlt: 'Gabrielle Chanel bottle glowing in a shaft of sunlight',
  },

  // Yves Saint Laurent
  {
    slug: 'ysl-libre-eau-de-parfum',
    brandSlug: 'ysl',
    name: 'Libre',
    concentration: 'Eau de Parfum',
    audience: 'her',
    family: 'amber',
    description:
      'French lavender and Moroccan orange blossom, burning with a warm vanilla and musk. The scent of freedom, worn loud.',
    notes: {
      top: ['Lavender', 'Mandarin', 'Black currant'],
      heart: ['Orange blossom', 'Jasmine'],
      base: ['Madagascar vanilla', 'Cedar', 'Ambergris', 'Musk'],
    },
    sizes: [size(50, 128), size(90, 162)],
    availability: 'InStock',
    bestseller: true,
    image: yslLibre,
    imageAlt: 'YSL Libre bottle with its gold cassandre in angled sunlight',
  },
  {
    slug: 'ysl-black-opium',
    brandSlug: 'ysl',
    name: 'Black Opium',
    concentration: 'Eau de Parfum',
    audience: 'her',
    family: 'gourmand',
    description:
      'Black coffee and white flowers over vanilla and patchouli — an addictive, after-dark gourmand with a rock-and-roll edge.',
    notes: {
      top: ['Pear', 'Pink pepper', 'Orange blossom'],
      heart: ['Coffee', 'Jasmine'],
      base: ['Vanilla', 'Patchouli', 'Cedar'],
    },
    sizes: [size(50, 122), size(90, 158)],
    availability: 'InStock',
    image: yslBlackOpium,
    imageAlt: 'Two glittering YSL Black Opium bottles on a dark surface',
    imagePosition: '38% 50%',
  },
  {
    slug: 'ysl-la-nuit-de-lhomme',
    brandSlug: 'ysl',
    name: 'La Nuit de L’Homme',
    concentration: 'Eau de Toilette',
    audience: 'him',
    family: 'woody',
    description:
      'Cardamom, lavender and cedar wrapped around a smooth vetiver core. Seductive, spicy and made for the evening.',
    notes: {
      top: ['Cardamom'],
      heart: ['Lavender', 'Cedar', 'Bergamot'],
      base: ['Vetiver', 'Caraway'],
    },
    sizes: [size(60, 96), size(100, 124)],
    availability: 'InStock',
    image: yslLaNuit,
    imageAlt: 'YSL La Nuit de L’Homme bottle on a stack of books',
  },

  // Armani
  {
    slug: 'armani-acqua-di-gio',
    brandSlug: 'armani',
    name: 'Acqua di Giò',
    concentration: 'Eau de Toilette',
    audience: 'him',
    family: 'fresh',
    description:
      'Sea spray, bergamot and green tangerine over rosemary and white musk. The definitive fresh aquatic, still in a league of its own.',
    notes: {
      top: ['Bergamot', 'Neroli', 'Green tangerine'],
      heart: ['Sea notes', 'Rosemary', 'Persimmon'],
      base: ['White musk', 'Cedar', 'Patchouli'],
    },
    sizes: [size(50, 88), size(100, 118)],
    availability: 'InStock',
    image: armaniAcquaDiGio,
    imageAlt: 'Frosted Acqua di Giò bottle on soft blue denim',
  },
  {
    slug: 'armani-acqua-di-gio-eau-de-parfum',
    brandSlug: 'armani',
    name: 'Acqua di Giò',
    concentration: 'Eau de Parfum',
    audience: 'him',
    family: 'aromatic',
    description:
      'A deeper, mineral Acqua di Giò: green mandarin and sea notes with clary sage and lavender over vetiver and patchouli.',
    notes: {
      top: ['Green mandarin', 'Sea notes'],
      heart: ['Clary sage', 'Lavender'],
      base: ['Vetiver', 'Patchouli'],
    },
    sizes: [size(75, 128), size(125, 162)],
    availability: 'InStock',
    image: armaniAcquaDiGioEdp,
    imageAlt: 'Acqua di Giò eau de parfum glowing amber under a warm lamp',
  },
  {
    slug: 'armani-stronger-with-you',
    brandSlug: 'armani',
    name: 'Stronger With You',
    concentration: 'Eau de Toilette',
    audience: 'him',
    family: 'amber',
    description:
      'Cardamom and pink pepper over sage, settling into a warm accord of chestnut, vanilla and amberwood. Cosy and magnetic.',
    notes: {
      top: ['Cardamom', 'Pink pepper', 'Violet leaf'],
      heart: ['Sage'],
      base: ['Chestnut', 'Vanilla', 'Amberwood'],
    },
    sizes: [size(50, 86), size(100, 112)],
    availability: 'InStock',
    image: armaniStrongerWithYou,
    imageAlt: 'Amber Stronger With You bottle on a pale shelf',
  },

  // Calvin Klein
  {
    slug: 'calvin-klein-ck-one',
    brandSlug: 'calvin-klein',
    name: 'CK One',
    concentration: 'Eau de Toilette',
    audience: 'unisex',
    family: 'fresh',
    description:
      'Bright citrus and green tea over a clean musk base. The original shared fragrance — easy, fresh and right for everyone.',
    notes: {
      top: ['Lemon', 'Bergamot', 'Pineapple', 'Papaya'],
      heart: ['Green tea', 'Jasmine', 'Violet'],
      base: ['Musk', 'Amber', 'Cedar'],
    },
    sizes: [size(100, 52), size(200, 72)],
    availability: 'InStock',
    image: ckOne,
    imageAlt: 'Frosted CK One bottle wrapped in white cotton',
  },
  {
    slug: 'calvin-klein-ck-all',
    brandSlug: 'calvin-klein',
    name: 'CK All',
    concentration: 'Eau de Toilette',
    audience: 'unisex',
    family: 'fresh',
    description:
      'Sparkling mandarin and bergamot with neroli and jasmine on a soft musk base. Carefree citrus freshness for anyone.',
    notes: {
      top: ['Mandarin', 'Bergamot'],
      heart: ['Neroli', 'Jasmine'],
      base: ['Musk', 'Amber'],
    },
    sizes: [size(100, 56), size(200, 78)],
    availability: 'InStock',
    image: ckAll,
    imageAlt: 'White CK All bottle lying among lavender sprigs',
  },
  {
    slug: 'calvin-klein-eternity',
    brandSlug: 'calvin-klein',
    name: 'Eternity',
    concentration: 'Eau de Parfum',
    audience: 'her',
    family: 'floral',
    description:
      'Freesia and mandarin open onto white lily and rose, resting on sandalwood and amber. A timeless, romantic floral.',
    notes: {
      top: ['Freesia', 'Mandarin'],
      heart: ['White lily', 'Marigold', 'Rose'],
      base: ['Sandalwood', 'Patchouli', 'Amber'],
    },
    sizes: [size(50, 62), size(100, 84)],
    availability: 'InStock',
    image: ckEternity,
    imageAlt: 'Clear faceted Calvin Klein Eternity bottle on a reflective surface',
  },
];
