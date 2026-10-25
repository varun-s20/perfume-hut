export const MAX_EMAIL_LENGTH = 254;

// Pragmatic check: one @, a dot in the domain, no whitespace. Deliverability is
// the email provider's job; this only catches obvious typos.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return value.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(value);
}

/** Reads a trimmed string field from FormData, treating anything else as empty. */
export function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export type FormState<Field extends string = string> = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Partial<Record<Field, string>>;
};
