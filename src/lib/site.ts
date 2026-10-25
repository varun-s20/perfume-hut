function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProduction) return `https://${vercelProduction}`;

  return 'https://perfumehut.co';
}

export const siteConfig = {
  name: 'Perfume Hut',
  domain: 'perfumehut.co',
  tagline: 'Designer fragrance, the real thing',
  description:
    'Step inside Perfume Hut — authentic designer fragrances from Versace, Gucci, Prada, Dior, Chanel, YSL, Armani and Calvin Klein, curated by people who spent decades behind the fragrance counter.',
  email: 'hello@perfumehut.co',
  locale: 'en_US',
  url: resolveSiteUrl(),
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}
