import { describe, expect, it } from 'vitest';
import { isValidEmail, readField } from './validation';

describe('isValidEmail', () => {
  it.each(['ava@perfumehut.co', 'first.last+tag@mail.example.com'])('accepts %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each(['', 'ava', 'ava@', 'ava@perfumehut', 'ava @perfumehut.co', `${'a'.repeat(250)}@x.co`])(
    'rejects %j',
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );
});

describe('readField', () => {
  it('trims strings and treats missing or file values as empty', () => {
    const data = new FormData();
    data.set('name', '  Ava  ');
    data.set('file', new Blob(['x']));
    expect(readField(data, 'name')).toBe('Ava');
    expect(readField(data, 'file')).toBe('');
    expect(readField(data, 'missing')).toBe('');
  });
});
