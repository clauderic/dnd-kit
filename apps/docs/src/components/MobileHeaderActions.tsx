import { Icon } from './Icon';
import { openSearch } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';

export function MobileActionButtons() {
  return (
    <div className="flex md:hidden items-center gap-2">
      <button
        type="button"
        className="text-gray-500 dark:text-gray-400 w-8 h-8 flex items-center justify-center hover:text-gray-600 dark:hover:text-gray-200"
        onClick={openSearch}
        aria-label="Search"
      >
        <Icon icon="search" iconLibrary="lucide" size={16} color="dimgray" />
      </button>
      <a
        href="https://github.com/clauderic/dnd-kit"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 dark:text-gray-400 w-8 h-8 flex items-center justify-center hover:text-gray-600 dark:hover:text-gray-200"
        aria-label="GitHub"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
      </a>
      <ThemeToggle />
    </div>
  );
}

export function TabletSearchButton() {
  return (
    <button
      type="button"
      className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
      onClick={openSearch}
      aria-label="Search"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    </button>
  );
}

export function MobileNavToggle({
  pageTitle,
  groupName,
}: {
  pageTitle: string;
  groupName?: string;
}) {
  const handleToggle = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
  };

  return (
    <button
      type="button"
      className="flex items-center h-14 py-4 lg:px-[5vw] lg:hidden focus:outline-0 w-full text-left"
      onClick={handleToggle}
    >
      <div className="flex items-center text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200">
        <span className="sr-only">Navigation</span>
        <Icon icon="menu" iconLibrary="lucide" size={18} />
      </div>
      <div className="ml-4 flex text-sm leading-6 whitespace-nowrap min-w-0 space-x-3 overflow-hidden">
        {groupName && (
          <div className="flex items-center space-x-3 shrink-0">
            <span>{groupName}</span>
            <Icon
              icon="chevron-right"
              iconLibrary="lucide"
              size={16}
              className="text-gray-400 dark:text-gray-500"
            />
          </div>
        )}
        <div className="font-semibold text-gray-900 dark:text-gray-200 truncate min-w-0 flex-1">
          {pageTitle}
        </div>
      </div>
    </button>
  );
}
