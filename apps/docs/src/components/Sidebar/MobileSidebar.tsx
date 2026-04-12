import { useState, useEffect } from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../Icon';
import type { NavNode, TabInfo } from '@mintlify/astro/helpers';
import { unwrapNav } from '@mintlify/astro/helpers';
import { type SidebarItemStyle, type AnchorItem } from './types';
import { SidebarEntries } from './SidebarEntries';
import { Anchors } from './Anchors';
import { TabsDropdown } from './TabsDropdown';

interface MobileSidebarProps {
  navigation: NavNode;
  currentPath: string;
  tabs?: TabInfo[];
  anchors?: AnchorItem[];
  sidebarItemStyle?: SidebarItemStyle;
  showDivider?: boolean;
}

export function MobileSidebar({
  navigation,
  currentPath,
  tabs = [],
  anchors = [],
  sidebarItemStyle = 'container',
  showDivider = false,
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const entries = unwrapNav(navigation, currentPath);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    return () =>
      window.removeEventListener('toggle-mobile-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-60 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 w-[20rem] bg-white dark:bg-background-dark z-70 transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 pt-5 pb-4">
            <a href="/">
              <img
                src="/images/logo/logo.svg"
                alt="dnd kit"
                width="135"
                height="45"
                className="h-[38px] w-auto"
              />
            </a>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-white/5"
              aria-label="Close navigation"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto pt-4 pb-8">
            {tabs.length > 0 && (
              <div className="px-4 mb-4">
                <TabsDropdown tabs={tabs} />
              </div>
            )}

            {anchors.length > 0 && (
              <div className="px-2">
                <Anchors anchors={anchors} />
              </div>
            )}

            <div className="px-4">
              <SidebarEntries
                entries={entries}
                currentPath={currentPath}
                sidebarItemStyle={sidebarItemStyle}
                showDivider={showDivider}
              />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
