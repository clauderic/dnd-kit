import { useState } from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../Icon';
import type { NavGroup } from '@mintlify/astro/helpers';
import { isNavPage, isNavGroup, containsPath } from '@mintlify/astro/helpers';
import type { SidebarItemStyle } from './types';
import { SideNavItem } from './SideNavItem';

interface SidebarGroupItemProps {
  group: NavGroup;
  currentPath: string;
  sidebarItemStyle?: SidebarItemStyle;
  isNested?: boolean;
}

export function SidebarGroupItem({
  group,
  currentPath,
  sidebarItemStyle,
  isNested = false,
}: SidebarGroupItemProps) {
  const hasActiveChild = containsPath(group.pages, currentPath);
  const [isOpen, setIsOpen] = useState(hasActiveChild || !isNested);

  // Nested groups (sub-groups like "Plugins", "Sensors") are collapsible
  if (isNested) {
    return (
      <li>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 w-full pl-4 pr-3 py-1.5 text-left text-sm rounded-xl cursor-pointer',
            'text-gray-700 hover:text-gray-900 hover:bg-gray-600/5 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5',
            hasActiveChild && 'font-medium text-gray-900 dark:text-gray-200',
          )}
        >
          {group.icon && (
            <Icon
              icon={group.icon}
              className={cn(
                'shrink-0',
                hasActiveChild ? 'text-(--primary)' : 'text-gray-400 dark:text-gray-500',
              )}
              size={16}
              color="currentColor"
            />
          )}
          <span className="flex-1 truncate">{group.group}</span>
          <Icon
            icon="chevron-right"
            size={14}
            color="currentColor"
            className={cn(
              'text-gray-400 dark:text-gray-500 transition-transform duration-150',
              isOpen && 'rotate-90',
            )}
          />
        </button>
        {isOpen && (
          <ul className="ml-4">
            {group.pages.map((entry) => {
              if (isNavPage(entry)) {
                return (
                  <SideNavItem
                    key={entry.href}
                    page={entry}
                    currentPath={currentPath}
                    sidebarItemStyle={sidebarItemStyle}
                  />
                );
              }
              if (isNavGroup(entry)) {
                return (
                  <SidebarGroupItem
                    key={entry.group}
                    group={entry}
                    currentPath={currentPath}
                    sidebarItemStyle={sidebarItemStyle}
                    isNested
                  />
                );
              }
              return null;
            })}
          </ul>
        )}
      </li>
    );
  }

  // Top-level groups render as section headers
  return (
    <>
      <div className="flex items-center gap-2.5 pl-4 mb-3.5 lg:mb-2.5 font-semibold text-gray-900 dark:text-gray-200">
        {group.icon && (
          <Icon
            icon={group.icon}
            className="h-3.5 w-3.5 bg-current"
            overrideColor={true}
            size={14}
          />
        )}
        <h5>{group.group}</h5>
      </div>

      <ul>
        {group.pages.map((entry) => {
          if (isNavPage(entry)) {
            return (
              <SideNavItem
                key={entry.href}
                page={entry}
                currentPath={currentPath}
                sidebarItemStyle={sidebarItemStyle}
              />
            );
          }
          if (isNavGroup(entry)) {
            return (
              <SidebarGroupItem
                key={entry.group}
                group={entry}
                currentPath={currentPath}
                sidebarItemStyle={sidebarItemStyle}
                isNested
              />
            );
          }
          return null;
        })}
      </ul>
    </>
  );
}
