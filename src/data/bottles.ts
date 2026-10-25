import type { StaticImageData } from 'next/image';
import armaniAcquaDiGio from '@/assets/images/bottles/armani-acqua-di-gio.webp';
import armaniAcquaDiGioEdp from '@/assets/images/bottles/armani-acqua-di-gio-edp.webp';
import armaniStrongerWithYou from '@/assets/images/bottles/armani-stronger-with-you.webp';
import chanelBleu from '@/assets/images/bottles/chanel-bleu.webp';
import chanelChance from '@/assets/images/bottles/chanel-chance-eau-tendre.webp';
import chanelCocoMademoiselle from '@/assets/images/bottles/chanel-coco-mademoiselle.webp';
import chanelGabrielle from '@/assets/images/bottles/chanel-gabrielle.webp';
import chanelNo5 from '@/assets/images/bottles/chanel-no5.webp';
import ckAll from '@/assets/images/bottles/ck-all.webp';
import ckEternity from '@/assets/images/bottles/ck-eternity.webp';
import ckOne from '@/assets/images/bottles/ck-one.webp';
import diorBloomingBouquet from '@/assets/images/bottles/dior-blooming-bouquet.webp';
import diorMissDior from '@/assets/images/bottles/dior-miss-dior.webp';
import diorSauvage from '@/assets/images/bottles/dior-sauvage.webp';
import gucciBloom from '@/assets/images/bottles/gucci-bloom.webp';
import gucciGuilty from '@/assets/images/bottles/gucci-guilty-pour-femme.webp';
import gucciMemoire from '@/assets/images/bottles/gucci-memoire.webp';
import pradaCandy from '@/assets/images/bottles/prada-candy.webp';
import pradaLHomme from '@/assets/images/bottles/prada-lhomme.webp';
import pradaLunaRossaBlack from '@/assets/images/bottles/prada-luna-rossa-black.webp';
import versaceCrystalNoir from '@/assets/images/bottles/versace-crystal-noir.webp';
import versaceDylanBlue from '@/assets/images/bottles/versace-dylan-blue.webp';
import versaceErosEdp from '@/assets/images/bottles/versace-eros-edp.webp';
import versaceErosEdt from '@/assets/images/bottles/versace-eros-edt.webp';
import yslBlackOpium from '@/assets/images/bottles/ysl-black-opium.webp';
import yslLaNuit from '@/assets/images/bottles/ysl-la-nuit.webp';
import yslLibre from '@/assets/images/bottles/ysl-libre.webp';

/**
 * Each bottle cut out of its product photograph (BiRefNet, then straightened),
 * for standing on cabinet shelves. Keyed by product slug.
 */
export const bottleCutouts: Record<string, StaticImageData> = {
  'versace-eros-eau-de-toilette': versaceErosEdt,
  'versace-eros-eau-de-parfum': versaceErosEdp,
  'versace-dylan-blue': versaceDylanBlue,
  'versace-crystal-noir': versaceCrystalNoir,
  'gucci-bloom': gucciBloom,
  'gucci-guilty-pour-femme': gucciGuilty,
  'gucci-memoire-dune-odeur': gucciMemoire,
  'prada-luna-rossa-black': pradaLunaRossaBlack,
  'prada-lhomme': pradaLHomme,
  'prada-candy': pradaCandy,
  'dior-sauvage-eau-de-parfum': diorSauvage,
  'dior-miss-dior-eau-de-parfum': diorMissDior,
  'dior-miss-dior-blooming-bouquet': diorBloomingBouquet,
  'chanel-no5-eau-de-parfum': chanelNo5,
  'chanel-coco-mademoiselle': chanelCocoMademoiselle,
  'bleu-de-chanel-eau-de-parfum': chanelBleu,
  'chanel-chance-eau-tendre': chanelChance,
  'chanel-gabrielle': chanelGabrielle,
  'ysl-libre-eau-de-parfum': yslLibre,
  'ysl-black-opium': yslBlackOpium,
  'ysl-la-nuit-de-lhomme': yslLaNuit,
  'armani-acqua-di-gio': armaniAcquaDiGio,
  'armani-acqua-di-gio-eau-de-parfum': armaniAcquaDiGioEdp,
  'armani-stronger-with-you': armaniStrongerWithYou,
  'calvin-klein-ck-one': ckOne,
  'calvin-klein-ck-all': ckAll,
  'calvin-klein-eternity': ckEternity,
};
