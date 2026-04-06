import { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@mintlify/components';

interface AssistantTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
  shouldFocus?: boolean;
  isMobile?: boolean;
}

export const AssistantTextArea = forwardRef<HTMLTextAreaElement, AssistantTextAreaProps>(
  function AssistantTextArea(
    {
      value,
      onChange,
      onSubmit,
      isLoading,
      disabled,
      shouldFocus,
    },
    ref,
  ) {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    useEffect(() => {
      if (shouldFocus && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [shouldFocus]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!disabled) {
          onSubmit();
        }
      }
    };

    return (
      <div className="relative flex items-center">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          rows={1}
          className={cn(
            'peer w-full py-1.5 pr-10 pl-9 rounded-xl resize-none outline-none text-sm',
            'bg-transparent',
            'text-gray-900 dark:text-gray-200',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'min-h-[32px] max-h-[120px]',
          )}
          style={{ resize: 'none' }}
        />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 shrink-0 text-gray-400 dark:text-gray-500 peer-focus:text-[var(--primary)] transition-colors pointer-events-none">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          <path d="M20 3v4" /><path d="M22 5h-4" />
        </svg>
        <span className="absolute right-11 text-[11px] text-gray-400 dark:text-gray-500 pointer-events-none peer-focus:hidden">⌘I</span>
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className={cn(
            'absolute right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all text-white',
            disabled
              ? 'cursor-not-allowed opacity-40'
              : 'hover:brightness-90 cursor-pointer',
          )}
          style={{
            backgroundColor: disabled
              ? 'transparent'
              : 'var(--primary)',
          }}
          aria-label="Send message"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin text-gray-400" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={disabled ? 'currentColor' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={disabled ? 'text-gray-400 dark:text-gray-500' : ''}>
              <path d="m5 12 7-7 7 7" /><path d="M12 19V5" />
            </svg>
          )}
        </button>
      </div>
    );
  },
);
