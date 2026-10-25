import { type Audience, type Family, families } from './catalog-types';

/** What Ava needs to know about a bottle in a cabinet. */
export type CabinetProduct = {
  slug: string;
  name: string;
  concentration: string;
  audience: Audience;
  family: Family;
  description: string;
  top: readonly string[];
  base: readonly string[];
  bestseller: boolean;
};

/** Who the visitor is choosing for. Unisex bottles suit everyone. */
export type Who = 'him' | 'her' | 'anyone';

export function suits(product: CabinetProduct, who: Who): boolean {
  return who === 'anyone' || product.audience === who || product.audience === 'unisex';
}

/** The people this cabinet can cater for; "anyone" is always on offer. */
export function whoChoices(products: readonly CabinetProduct[]): Who[] {
  const choices: Who[] = [];
  if (products.some((product) => product.audience !== 'her')) choices.push('him');
  if (products.some((product) => product.audience !== 'him')) choices.push('her');
  return [...choices, 'anyone'];
}

/** Fragrance families on the shelves for that person, in catalogue order. */
export function moodChoices(products: readonly CabinetProduct[], who: Who): Family[] {
  const present = new Set(products.filter((product) => suits(product, who)).map((p) => p.family));
  return families.filter((family) => present.has(family));
}

export type Recommendation<T extends CabinetProduct = CabinetProduct> = {
  product: T;
  /** False when nothing matched exactly and Ava widened the search. */
  exact: boolean;
};

/**
 * Ava's pick: a bestseller that fits, otherwise the first bottle that fits.
 * With no family (or no exact match) she widens to everything that suits.
 */
export function recommend<T extends CabinetProduct>(
  products: readonly T[],
  who: Who,
  family?: Family,
): Recommendation<T> | undefined {
  const forWho = products.filter((product) => suits(product, who));
  const exact = family ? forWho.filter((product) => product.family === family) : forWho;
  const pool = exact.length > 0 ? exact : forWho.length > 0 ? forWho : products;
  const product = pool.find((candidate) => candidate.bestseller) ?? pool[0];
  return product && { product, exact: exact.length > 0 };
}

/** The first sentence of a description, for a spoken summary. */
export function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?](?=\s|$)/);
  return (match ? match[0] : text).trim();
}

/** "bergamot and pink pepper" — the first notes, joined the way people say them. */
export function speakNotes(notes: readonly string[], count = 2): string {
  const picked = notes.slice(0, count).map((note) => note.toLowerCase());
  if (picked.length <= 1) return picked.join('');
  return `${picked.slice(0, -1).join(', ')} and ${picked.at(-1)}`;
}
