import { describe, expect, it } from 'vitest';

import type { InboxRow, MessageRow } from '@/shared/data/database.types';
import { sameLanguage } from '@/shared/lib/language';

import { firstLine, localizeTickets, missingTranslations } from './translations';

const ticket = (patch: Partial<InboxRow>): InboxRow => ({
  id: 't1',
  number: 1042,
  user_id: 'u1',
  kind: 'bug',
  status: 'open',
  priority: null,
  subject: '구독이 사라졌어요',
  platform: 'ios',
  os_version: '26.1',
  device_model: 'iPhone 16',
  app_version: '1.4.2',
  created_at: '2026-11-01T08:00:00Z',
  updated_at: '2026-11-01T08:00:00Z',
  closed_at: null,
  last_author: 'team',
  last_preview: 'Bitte stell die Käufe wieder her.',
  last_activity_at: '2026-11-01T09:00:00Z',
  user_activity_at: '2026-11-01T08:00:00Z',
  read_at: null,
  unread: true,
  first_message_id: 'm1',
  last_message_id: 'm2',
  ...patch,
});

const message = (id: string, patch: Partial<MessageRow>): MessageRow => ({
  id,
  user_id: 'u1',
  ticket_id: 't1',
  author: 'user',
  content: 'text',
  attachments: [],
  language: null,
  created_at: '2026-11-01T08:00:00Z',
  ...patch,
});

describe('sameLanguage', () => {
  it('ignores the region, so pt-PT and pt-BR count as one', () => {
    expect(sameLanguage('pt-BR', 'pt-PT')).toBe(true);
    expect(sameLanguage('de', 'de-AT')).toBe(true);
    expect(sameLanguage('ko', 'de')).toBe(false);
  });
});

describe('localizeTickets', () => {
  it('takes subject and preview from the translations and keeps the originals', () => {
    const translations = new Map([
      ['m1', 'Mein Abo ist weg\nseit dem Gerätewechsel'],
      ['m2', 'Please restore your purchases.'],
    ]);
    const [row] = localizeTickets([ticket({})], translations);
    expect(row?.subject).toBe('Mein Abo ist weg');
    expect(row?.last_preview).toBe('Please restore your purchases.');
    expect(row?.original_subject).toBe('구독이 사라졌어요');
    expect(row?.original_preview).toBe('Bitte stell die Käufe wieder her.');
  });

  it('shows the originals without translations', () => {
    const [row] = localizeTickets([ticket({})], new Map());
    expect(row?.subject).toBe('구독이 사라졌어요');
    expect(row?.last_preview).toBe('Bitte stell die Käufe wieder her.');
  });

  it('cuts a subject like the app does', () => {
    expect(firstLine(`  ${'a'.repeat(130)}\nmore`)).toHaveLength(120);
  });
});

describe('missingTranslations', () => {
  const now = Date.parse('2026-11-01T08:10:00Z');
  it('asks for messages in other languages, not for its own or empty ones', () => {
    const messages = [
      message('ko', { language: 'ko' }),
      message('de', { language: 'de' }),
      message('done', { language: 'ko' }),
      message('screenshots', { language: null, content: '  ' }),
    ];
    const missing = missingTranslations(messages, new Map([['done', 'x']]), 'de', now);
    expect(missing.map((m) => m.id)).toEqual(['ko']);
  });

  it('waits a moment for the server to detect a new message', () => {
    const fresh = message('fresh', { created_at: '2026-11-01T08:09:50Z' });
    const stale = message('stale', { created_at: '2026-11-01T08:00:00Z' });
    expect(missingTranslations([fresh, stale], new Map(), 'en', now).map((m) => m.id)).toEqual([
      'stale',
    ]);
  });
});
