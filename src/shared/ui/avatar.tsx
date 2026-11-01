import { cn } from '../lib/cn';

const SIZES = {
  sm: 'size-[30px] text-[11px]',
  md: 'size-[34px] text-[12px]',
  lg: 'size-14 text-[18px]',
} as const;

export interface AvatarProps {
  initials: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/** A customer's initials in a grey circle. */
export function Avatar({ initials, size = 'md', className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-avatar font-semibold',
        SIZES[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}
