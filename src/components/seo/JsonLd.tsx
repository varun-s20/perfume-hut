import { type JsonLdDocument, serializeJsonLd } from '@/lib/structured-data';

export function JsonLd({ data }: { data: JsonLdDocument }) {
  return (
    <script
      type="application/ld+json"
      // Safe: serializeJsonLd escapes `<` so the payload cannot break out of the tag.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
