import { describe, expect, it } from 'vitest';

import type { CustomerRow } from '../data/database.types';
import { displayName, initials } from './people';

const customer = (patch: Partial<CustomerRow>): CustomerRow => ({
  user_id: 'u1',
  first_name: null,
  language: 'de',
  email: null,
  provider: 'apple',
  signed_up_at: '2026-01-01T00:00:00Z',
  last_active_at: null,
  ...patch,
});

describe('displayName', () => {
  it('prefers the first name, then the email, then the fallback', () => {
    expect(displayName(customer({ first_name: ' Lena ' }), '?')).toBe('Lena');
    expect(displayName(customer({ email: 'lena.k@example.com' }), '?')).toBe('lena.k');
    expect(displayName(customer({}), 'Unbekannt')).toBe('Unbekannt');
    expect(displayName(undefined, 'Unbekannt')).toBe('Unbekannt');
  });
});

describe('initials', () => {
  it('takes two words, one letter, or a Korean given name', () => {
    expect(initials('Emily Carter')).toBe('EC');
    expect(initials('lena')).toBe('L');
    expect(initials('김하린')).toBe('하린');
    expect(initials('하린')).toBe('하린');
    expect(initials('  ')).toBe('?');
  });
});
