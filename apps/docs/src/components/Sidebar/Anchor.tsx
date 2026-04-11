import { cn } from '../../lib/cn';
import type { AnchorItem } from './types';
import { Icon } from '../Icon';

export function Anchor({ name, href, icon, color, isActive }: AnchorItem) {
  const isExternal =
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//');

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      style={
        { '--anchor-color': color || 'var(--primary)' } as React.CSSProperties
      }
      className={cn(
        'group flex items-center ml-4 lg:ml-0 lg:text-sm lg:leading-6 mb-5 sm:mb-4 font-medium outline-offset-4',
        isActive
          ? 'text-(--primary)'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
      )}
    >
      {icon && (
        <span
          className={cn(
            'mr-4 rounded-md inline-flex items-center justify-center w-6 h-6 p-1',
            'ring-1 ring-gray-950/[0.07] dark:ring-white/10',
            isActive
              ? '[background:var(--anchor-color)] text-white'
              : 'text-gray-500 dark:text-gray-500 group-hover:[background:var(--anchor-color)] group-hover:text-white',
          )}
        >
          <Icon
            icon={icon}
            size={16}
            color="currentColor"
          />
        </span>
      )}
      {name}
    </a>
  );
}
