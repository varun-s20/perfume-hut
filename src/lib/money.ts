export type CurrencyCode = 'USD';

/** A monetary amount in minor units (cents), so arithmetic never touches floats. */
export type Money = {
  amount: number;
  currency: CurrencyCode;
};

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: CurrencyCode, locale: string): Intl.NumberFormat {
  const key = `${locale}|${currency}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      trailingZeroDisplay: 'stripIfInteger',
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

/** Formats for display: `$55` for whole amounts, `$55.99` otherwise. */
export function formatMoney({ amount, currency }: Money, locale = 'en-US'): string {
  return getFormatter(currency, locale).format(amount / 100);
}

/** Fixed two-decimal string for machine consumers such as schema.org offers. */
export function toDecimalString({ amount }: Money): string {
  return (amount / 100).toFixed(2);
}
