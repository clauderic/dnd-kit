import { Icon } from '@mintlify/components';
import { toggleAssistant } from './events';

export function AssistantButton() {
  return (
    <button
      onClick={toggleAssistant}
      type="button"
      className="flex items-center justify-center gap-1.5 pl-3 pr-3.5 h-9 rounded-xl shadow-sm bg-white dark:bg-background-dark ring-1 ring-gray-400/20 dark:ring-white/10 hover:ring-gray-600/25 dark:hover:ring-white/20 transition-all cursor-pointer"
      aria-label="Toggle AI Assistant"
    >
      <Icon
        icon="sparkles"
        iconLibrary="lucide"
        size={16}
        color="dimgray"
        className="shrink-0"
      />
      <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Ask AI</span>
    </button>
  );
}
