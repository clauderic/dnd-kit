import { Icon } from '@mintlify/components';
import { openSearch } from './SearchBar';
import { toggleAssistant } from './Assistant/events';

export function MobileActionButtons() {
  return (
    <div className="flex lg:hidden items-center gap-2">
      <button
        type="button"
        className="text-gray-500 w-8 h-8 flex items-center justify-center hover:text-gray-600"
        onClick={openSearch}
        aria-label="Search"
      >
        <Icon icon="search" iconLibrary="lucide" size={16} color="dimgray" />
      </button>
      <button
        type="button"
        className="text-gray-500 w-8 h-8 flex items-center justify-center hover:text-gray-600"
        onClick={toggleAssistant}
        aria-label="AI Assistant"
      >
        <Icon icon="sparkles" iconLibrary="lucide" size={16} color="dimgray" />
      </button>
    </div>
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
      <div className="flex items-center text-gray-500 hover:text-gray-600">
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
              className="text-gray-400"
            />
          </div>
        )}
        <div className="font-semibold text-gray-900 truncate min-w-0 flex-1">
          {pageTitle}
        </div>
      </div>
    </button>
  );
}
