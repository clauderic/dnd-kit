import { cn, Icon } from '@mintlify/components';
import type { AnchorItem } from './types';
import { frameworkIconMap } from '../../icons/FrameworkIcons';

export function Anchor({ name, href, icon, color, isActive }: AnchorItem) {
  const isExternal =
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//');

  const FrameworkIcon = icon ? frameworkIconMap[icon] : undefined;

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
          : 'text-gray-600 hover:text-gray-900',
      )}
    >
      {icon && (
        <span
          className={cn(
            'mr-4 rounded-md inline-flex items-center justify-center w-6 h-6 p-1',
            'ring-1 ring-gray-950/[0.07]',
            isActive
              ? '[background:var(--anchor-color)]'
              : 'group-hover:[background:var(--anchor-color)]',
          )}
        >
          {FrameworkIcon ? (
            <FrameworkIcon
              className={cn(
                isActive
                  ? 'text-white'
                  : 'text-gray-600 group-hover:text-white',
              )}
              size={16}
            />
          ) : (
            <Icon
              icon={icon}
              className={cn(
                isActive
                  ? 'bg-white'
                  : 'bg-gray-600 group-hover:bg-white',
              )}
              overrideColor
              size={16}
            />
          )}
        </span>
      )}
      {name}
    </a>
  );
}
