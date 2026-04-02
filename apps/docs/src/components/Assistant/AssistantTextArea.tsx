import { useRef, useEffect } from 'react';
import { cn, Icon } from '@mintlify/components';

interface AssistantTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
  shouldFocus?: boolean;
  isMobile?: boolean;
}

export function AssistantTextArea({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled,
  shouldFocus,
  isMobile = false,
}: AssistantTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question..."
        rows={2}
        className={cn(
          'w-full py-3 pr-10 pl-3 rounded-xl resize-none outline-none',
          isMobile ? 'text-base' : 'text-sm',
          'border border-gray-200',
          'bg-white',
          'text-gray-900',
          'placeholder:text-gray-400',
          'focus:ring-2 min-h-[48px] transition-shadow',
        )}
        style={
          {
            '--tw-ring-color':
              'color-mix(in srgb, var(--primary) 20%, transparent)',
            resize: 'none',
            fontSize: isMobile ? '16px' : undefined,
          } as React.CSSProperties
        }
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '';
        }}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className={cn(
          'absolute right-2 bottom-3 w-6 h-6 rounded-full flex items-center justify-center transition-all text-white',
          disabled
            ? 'cursor-not-allowed'
            : 'hover:brightness-90 cursor-pointer',
        )}
        style={{
          backgroundColor: disabled
            ? 'color-mix(in srgb, var(--primary) 30%, transparent)'
            : 'var(--primary)',
        }}
        aria-label="Send message"
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Icon icon="arrow-up" color="white" iconLibrary="lucide" size={16} />
        )}
      </button>
    </div>
  );
}
