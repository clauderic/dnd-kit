import { cn } from '../../lib/cn';
import { Icon } from '../Icon';
import type { NavPage } from '@mintlify/astro/helpers';
import type { SidebarItemStyle } from './types';

export interface SideNavItemProps {
  page: NavPage;
  currentPath: string;
  sidebarItemStyle?: SidebarItemStyle;
}

const ACTIVE_TEXT = 'text-(--primary) font-medium';

const sidebarStyles: Record<
  SidebarItemStyle,
  { base?: string; active: string; inactive: string }
> = {
  container: {
    base: 'rounded-xl w-full outline-offset-[-1px]',
    active: `bg-(--primary)/10 ${ACTIVE_TEXT}`,
    inactive: 'hover:bg-gray-600/5 dark:hover:bg-white/5 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
  },
  card: {
    base: 'ml-4 border-l outline-offset-[-1px]',
    active: `border-(--primary) bg-(--primary)/10 ${ACTIVE_TEXT}`,
    inactive:
      'border-gray-950/5 dark:border-white/5 hover:bg-gray-600/5 dark:hover:bg-white/5 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
  },
  border: {
    base: 'ml-4 border-l py-2 lg:py-1.5 w-[calc(100%-1rem)]',
    active: `border-(--primary) ${ACTIVE_TEXT}`,
    inactive:
      'border-gray-950/5 dark:border-white/5 hover:border-gray-950/20 dark:hover:border-white/20 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
  },
  undecorated: {
    active: `border-(--primary) ${ACTIVE_TEXT}`,
    inactive:
      'border-gray-950/5 dark:border-white/5 hover:border-gray-950/20 dark:hover:border-white/20 text-gray-700 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-200',
  },
  arrow: {
    active: `border-(--primary) ${ACTIVE_TEXT}`,
    inactive:
      'border-gray-950/5 dark:border-white/5 hover:border-gray-950/20 dark:hover:border-white/20 text-gray-700 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-200',
  },
  plain: {
    active: ACTIVE_TEXT,
    inactive: 'text-gray-950 hover:text-(--primary) dark:text-gray-200',
  },
};

export function SideNavItem({
  page,
  currentPath,
  sidebarItemStyle = 'container',
}: SideNavItemProps) {
  const isActive = page.href === currentPath;
  const title = page.title;
  const isOneWord = title.split(' ').length === 1;
  const variant = sidebarStyles[sidebarItemStyle];

  return (
    <li className="relative scroll-m-4 first:scroll-m-20" data-title={title}>
      <a
        href={page.href}
        className={cn(
          'group flex items-center pl-4 pr-3 py-1.5 cursor-pointer gap-x-3 text-left',
          isOneWord && 'wrap-break-word hyphens-auto',
          variant.base,
          isActive ? variant.active : variant.inactive,
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        {sidebarItemStyle === 'arrow' && isActive && (
          <Icon
            icon="chevron-right"
            className="absolute left-0 text-(--primary) group-hover:text-(--primary)"
            size={16}
            color="var(--primary)"
          />
        )}
        {page.icon && (
          <Icon
            icon={page.icon}
            className={cn(
              'shrink-0',
              isActive ? 'text-(--primary)' : 'text-gray-400 dark:text-gray-500',
            )}
            size={16}
            color="currentColor"
          />
        )}
        <span className="flex-1 truncate min-w-0">{title}</span>
        {page.deprecated && (
          <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400">
            Deprecated
          </span>
        )}
      </a>
    </li>
  );
}
