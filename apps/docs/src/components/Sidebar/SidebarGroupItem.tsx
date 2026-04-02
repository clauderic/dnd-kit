import { Icon } from '@mintlify/components';
import type { NavGroup } from '@mintlify/astro/helpers';
import { isNavPage, isNavGroup } from '@mintlify/astro/helpers';
import type { SidebarItemStyle } from './types';
import { SideNavItem } from './SideNavItem';

interface SidebarGroupItemProps {
  group: NavGroup;
  currentPath: string;
  sidebarItemStyle?: SidebarItemStyle;
}

export function SidebarGroupItem({
  group,
  currentPath,
  sidebarItemStyle,
}: SidebarGroupItemProps) {
  return (
    <>
      <div className="flex items-center gap-2.5 pl-4 mb-3.5 lg:mb-2.5 font-semibold text-gray-900">
        {group.icon && (
          <Icon
            icon={group.icon}
            iconLibrary="lucide"
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
              <li key={entry.group}>
                <SidebarGroupItem
                  group={entry}
                  currentPath={currentPath}
                  sidebarItemStyle={sidebarItemStyle}
                />
              </li>
            );
          }
          return null;
        })}
      </ul>
    </>
  );
}
