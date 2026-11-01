import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Link, useNavigate } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { signOut } from '../data/session';
import { useInbox } from '../data/tickets';
import { cn } from '../lib/cn';
import { menuItem, menuSurface } from '../ui/menu';
import { LanguageMenu } from './language-menu';

function InboxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <rect
        x="2.5"
        y="4.5"
        width="15"
        height="11"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M3.5 6l6.5 4.8L16.5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <rect
        x="2.5"
        y="4"
        width="15"
        height="12"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
      <circle cx="7.5" cy="9" r="1.8" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path
        d="M4.8 13.2c.5-1.2 1.5-1.8 2.7-1.8s2.2.6 2.7 1.8M12 8.5h3M12 11.5h2"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface NavLinkProps {
  to: '/inbox' | '/customers';
  label: string;
  badge?: number;
  children: ReactNode;
}

function NavLink({ to, label, badge, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      title={label}
      aria-label={badge ? `${label} (${badge})` : label}
      className="relative flex size-11 items-center justify-center rounded-full text-ink hover:opacity-70"
      activeProps={{ className: 'bg-ink text-white hover:opacity-100' }}
    >
      {children}
      {badge ? (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white ring-2 ring-canvas">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  );
}

function AccountMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const leave = async () => {
    await signOut();
    await navigate({ to: '/login' });
  };
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        title={t('account.name')}
        className="flex size-9 items-center justify-center rounded-full bg-chip-hover text-xs font-semibold outline-none hover:bg-line-2 focus-visible:ring-2 focus-visible:ring-ink"
      >
        {t('account.initials')}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="right"
          align="end"
          sideOffset={12}
          className={cn(menuSurface, 'w-[220px]')}
        >
          <div className="px-2.5 pt-2 pb-2.5 text-[13px] font-semibold">{t('account.name')}</div>
          <DropdownMenu.Item className={menuItem} onSelect={() => void leave()}>
            {t('account.signOut')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** The narrow rail on the left: logo, Inbox (with unread count), Customers, language, account. */
export function Sidebar() {
  const { t } = useTranslation();
  const { data: tickets } = useInbox();
  const unread = tickets?.filter((ticket) => ticket.unread).length ?? 0;

  return (
    <nav className="flex w-[68px] shrink-0 flex-col items-center gap-2.5 py-[18px]">
      <div
        aria-label={t('app.name')}
        className="mb-3.5 flex size-[38px] items-center justify-center rounded-xl bg-ink text-lg font-bold text-white"
      >
        {t('app.logo')}
      </div>
      <NavLink to="/inbox" label={t('nav.inbox')} badge={unread}>
        <InboxIcon />
      </NavLink>
      <NavLink to="/customers" label={t('nav.customers')}>
        <CustomersIcon />
      </NavLink>
      <div className="flex-1" />
      <div className="mb-2">
        <LanguageMenu />
      </div>
      <AccountMenu />
    </nav>
  );
}
