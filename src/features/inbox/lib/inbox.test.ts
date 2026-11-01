import { describe, expect, it } from 'vitest';

import type { CustomerMap } from '@/shared/data/customers';
import type { EventRow, InboxRow, MessageRow } from '@/shared/data/database.types';

import { matchesQuery, neighbour, nextAfterLeaving, statusCounts, visibleTickets } from './filter';
import { filterOf, parseInboxSearch } from './search';
import { shownStatus } from './status';
import { buildTimeline } from './timeline';

const ticket = (patch: Partial<InboxRow>): InboxRow => ({
  id: 't1',
  number: 1000,
  user_id: 'u1',
  kind: 'bug',
  status: 'open',
  priority: null,
  subject: 'App crashes',
  platform: 'ios',
  os_version: '26.1',
  device_model: 'iPhone 16 Pro',
  app_version: '1.4.2',
  created_at: '2026-11-01T08:00:00Z',
  updated_at: '2026-11-01T08:00:00Z',
  closed_at: null,
  last_author: 'user',
  last_preview: 'It crashes after the third photo',
  last_activity_at: '2026-11-01T08:00:00Z',
  user_activity_at: '2026-11-01T08:00:00Z',
  read_at: null,
  unread: true,
  first_message_id: null,
  last_message_id: null,
  ...patch,
});

const customers: CustomerMap = new Map([
  [
    'u1',
    {
      user_id: 'u1',
      first_name: 'Lena',
      language: 'de',
      email: 'lena@example.com',
      provider: 'apple',
      signed_up_at: '2026-01-01T00:00:00Z',
      last_active_at: null,
    },
  ],
]);

const a = ticket({ id: 'a', number: 1001 });
const b = ticket({ id: 'b', number: 1002, kind: 'idea', priority: 4, subject: 'Supersets' });
const c = ticket({ id: 'c', number: 1003, status: 'planned' });
const d = ticket({ id: 'd', number: 1004, user_id: 'u2', subject: 'Receipt' });
const all = [a, b, c, d];

describe('matchesQuery', () => {
  it('finds a ticket by number, subject, text, name or email; every word must match', () => {
    expect(matchesQuery(a, customers, '#1001')).toBe(true);
    expect(matchesQuery(a, customers, '1001')).toBe(true);
    expect(matchesQuery(a, customers, 'third photo')).toBe(true);
    expect(matchesQuery(a, customers, 'LENA')).toBe(true);
    expect(matchesQuery(a, customers, 'lena@example')).toBe(true);
    expect(matchesQuery(a, customers, 'lena receipt')).toBe(false);
    expect(matchesQuery(d, customers, 'lena')).toBe(false);
  });
});

describe('visibleTickets and statusCounts', () => {
  it('filter by status, type and search', () => {
    expect(visibleTickets(all, customers, { status: 'open', kind: 'all', q: '' })).toEqual([
      a,
      b,
      d,
    ]);
    expect(visibleTickets(all, customers, { status: 'open', kind: 'idea', q: '' })).toEqual([b]);
    expect(visibleTickets(all, customers, { status: 'open', kind: 'all', q: 'lena' })).toEqual([
      a,
      b,
    ]);
    expect(statusCounts(all, customers, 'bug', '')).toEqual({
      open: 2,
      planned: 1,
      resolved: 0,
      closed: 0,
    });
  });
});

describe('neighbour and nextAfterLeaving', () => {
  const list = [a, b, d];
  it('steps through the list and stops at the ends', () => {
    expect(neighbour(list, 'a', 1)).toBe(b);
    expect(neighbour(list, 'd', 1)).toBeNull();
    expect(neighbour(list, 'a', -1)).toBeNull();
    expect(neighbour(list, 'gone', 1)).toBe(a);
  });
  it('moves on to the next ticket, or the previous one at the end', () => {
    expect(nextAfterLeaving(list, 'b')).toBe(d);
    expect(nextAfterLeaving(list, 'd')).toBe(b);
    expect(nextAfterLeaving([a], 'a')).toBeNull();
  });
});

describe('parseInboxSearch', () => {
  it('keeps valid values and drops defaults and junk', () => {
    expect(
      parseInboxSearch({ status: 'planned', kind: 'idea', q: 'crash', ticket: '1042' }),
    ).toEqual({
      status: 'planned',
      kind: 'idea',
      q: 'crash',
      ticket: 1042,
    });
    expect(parseInboxSearch({ status: 'open', kind: 'all', q: '', ticket: '-3' })).toEqual({});
    expect(parseInboxSearch({ status: 'idea', ticket: '10.5' })).toEqual({});
    expect(filterOf({})).toEqual({ status: 'open', kind: 'all', q: '' });
  });
});

describe('shownStatus', () => {
  it('names a resolved ticket as the app does', () => {
    expect(shownStatus('bug', 'resolved')).toBe('fixed');
    expect(shownStatus('idea', 'resolved')).toBe('shipped');
    expect(shownStatus('idea', 'planned')).toBe('planned');
  });
});

describe('buildTimeline', () => {
  const message = (id: string, at: string): MessageRow => ({
    id,
    user_id: 'u1',
    ticket_id: 't1',
    author: 'user',
    content: id,
    attachments: [],
    language: null,
    created_at: at,
  });
  const event = (id: string, at: string): EventRow => ({
    id,
    user_id: 'u1',
    ticket_id: 't1',
    kind: 'status',
    status: 'planned',
    version: null,
    note: null,
    created_at: at,
  });
  it('orders by time, a message before an event at the same moment', () => {
    const items = buildTimeline(
      [message('m2', '2026-11-01T10:00:00Z'), message('m1', '2026-11-01T09:00:00Z')],
      [event('e1', '2026-11-01T10:00:00Z'), event('e0', '2026-11-01T08:00:00Z')],
    );
    expect(items.map((i) => i.key)).toEqual(['e0', 'm1', 'm2', 'e1']);
  });
});
