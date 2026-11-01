import { describe, expect, it } from 'vitest';

import type { InboxRow } from '@/shared/data/database.types';

import { matchesCustomer, summarize } from './summaries';

const ticket = (patch: Partial<InboxRow>): InboxRow => ({
  id: 't1',
  number: 1000,
  user_id: 'u1',
  kind: 'bug',
  status: 'resolved',
  priority: null,
  subject: 'Subject',
  platform: 'ios',
  os_version: '26.1',
  device_model: 'iPhone 16 Pro',
  app_version: '1.4.2',
  created_at: '2026-10-01T08:00:00Z',
  updated_at: '2026-10-01T08:00:00Z',
  closed_at: null,
  last_author: 'user',
  last_preview: null,
  last_activity_at: '2026-10-01T08:00:00Z',
  user_activity_at: '2026-10-01T08:00:00Z',
  read_at: null,
  unread: false,
  first_message_id: null,
  last_message_id: null,
  ...patch,
});

describe('summarize', () => {
  it('groups tickets per person, newest contact first', () => {
    // In the inbox's order: newest activity first.
    const tickets = [
      ticket({
        id: 'x',
        user_id: 'u2',
        last_activity_at: '2026-10-30T00:00:00Z',
        user_activity_at: '2026-10-29T00:00:00Z',
      }),
      ticket({
        id: 'y',
        user_id: 'u1',
        status: 'open',
        last_activity_at: '2026-10-20T00:00:00Z',
        user_activity_at: '2026-10-31T00:00:00Z',
      }),
      ticket({ id: 'z', user_id: 'u1' }),
    ];
    const rows = summarize(undefined, tickets);
    expect(rows.map((r) => [r.userId, r.count, r.hasOpen, r.latest.id, r.lastContact])).toEqual([
      ['u1', 2, true, 'y', '2026-10-31T00:00:00Z'],
      ['u2', 1, false, 'x', '2026-10-29T00:00:00Z'],
    ]);
  });
});

describe('matchesCustomer', () => {
  it('matches every word against name and email', () => {
    expect(matchesCustomer('Lena', 'lena@example.com', 'lena example')).toBe(true);
    expect(matchesCustomer('Lena', null, 'jonas')).toBe(false);
    expect(matchesCustomer('Lena', null, '')).toBe(true);
  });
});
