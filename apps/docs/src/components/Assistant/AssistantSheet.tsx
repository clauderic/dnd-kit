/**
 * Floating glassmorphism assistant — bottom-center input that
 * expands into a message panel when the user asks a question.
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '../../lib/cn';
import { useAssistant } from '../../hooks/useAssistant';
import { AssistantHistoryList } from './AssistantHistoryList';
import { AssistantTextArea } from './AssistantTextArea';
import { ASSISTANT_EVENTS, type CodeContext } from './events';

export function AssistantSheet() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  if (!isClient) return null;
  return <AssistantSheetClient />;
}

function AssistantSheetClient() {
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [codeContexts, setCodeContexts] = useState<CodeContext[]>([]);

  const {
    input,
    setInput,
    messages,
    status,
    handleSubmit,
    isLoading,
    onClear,
    regenerate,
  } = useAssistant();

  const hasMessages = messages.length > 0;
  const showPanel = hasMessages && isExpanded && !isMinimized;

  // Listen for assistant events
  useEffect(() => {
    const handleToggle = () => {
      if (showPanel) {
        setIsMinimized(true);
      } else if (hasMessages && isMinimized) {
        setIsMinimized(false);
        setIsExpanded(true);
      } else {
        inputRef.current?.focus();
      }
    };

    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const codeContext = detail?.codeContext as CodeContext | undefined;
      const query = detail?.query as string | undefined;
      if (codeContext) {
        setCodeContexts((prev) =>
          prev.some((c) => c.code === codeContext.code) ? prev : [...prev, codeContext]
        );
      }
      if (query) {
        setInput(query);
      }
      inputRef.current?.focus();
    };

    const handleClose = () => {
      setIsExpanded(false);
      setIsMinimized(false);
    };

    window.addEventListener(ASSISTANT_EVENTS.TOGGLE, handleToggle);
    window.addEventListener(ASSISTANT_EVENTS.OPEN, handleOpen);
    window.addEventListener(ASSISTANT_EVENTS.CLOSE, handleClose);

    return () => {
      window.removeEventListener(ASSISTANT_EVENTS.TOGGLE, handleToggle);
      window.removeEventListener(ASSISTANT_EVENTS.OPEN, handleOpen);
      window.removeEventListener(ASSISTANT_EVENTS.CLOSE, handleClose);
    };
  }, [showPanel, hasMessages, isMinimized]);

  const handleSubmitAndFocus = useCallback(() => {
    if (codeContexts.length > 0) {
      const contextStr = codeContexts
        .map((c) => `\`\`\`${c.language || ''}\n${c.code}\n\`\`\``)
        .join('\n\n');
      const fullInput = input.trim()
        ? `${input}\n\n${contextStr}`
        : `Explain this code:\n\n${contextStr}`;
      setInput(fullInput);
      setTimeout(() => {
        handleSubmit();
        setCodeContexts([]);
        setIsExpanded(true);
        setIsMinimized(false);
      }, 0);
    } else {
      handleSubmit();
      setIsExpanded(true);
      setIsMinimized(false);
    }
  }, [input, codeContexts, handleSubmit, setInput]);

  const handleClear = () => {
    onClear();
    setIsExpanded(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleExpand = () => {
    if (hasMessages) {
      setIsMinimized(false);
      setIsExpanded(true);
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-lg print:hidden',
        'transition-all duration-300 ease-in-out',
      )}
    >
      <div
        className={cn(
          'rounded-2xl overflow-hidden',
          'bg-white/80 dark:bg-[#0b0b10]/80',
          'backdrop-blur-xl backdrop-saturate-[180%]',
          'border border-gray-300/60 dark:border-white/15',
          'shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
          'flex flex-col',
        )}
      >
        {/* Expanded panel: header + messages */}
        {showPanel && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/30 dark:border-white/5">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleMinimize}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Minimize"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
                </button>
                {hasMessages && (
                  <button
                    onClick={handleClear}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    aria-label="Clear chat"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                  </button>
                )}
                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              className="flex flex-col-reverse flex-1 overflow-y-auto overflow-x-hidden px-4 min-h-0"
              style={{ maxHeight: 'calc(70vh - 120px)' }}
            >
              <div className="grow" />
              <AssistantHistoryList messages={messages} status={status} onRegenerate={regenerate} />
            </div>
          </>
        )}

        {/* Input area — always visible */}
        <div className={cn(
          'px-3 py-2',
          showPanel && 'border-t border-gray-200/30 dark:border-white/5',
        )}>
          {/* Code context chips */}
          {codeContexts.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {codeContexts.map((ctx, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2 py-1 border border-gray-200/50 dark:border-white/10 rounded-lg text-xs"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-500 dark:text-gray-400"><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" /></svg>
                  <span className="text-gray-700 dark:text-gray-300 max-w-[100px] truncate">{ctx.code.split('\n')[0]}</span>
                  <button
                    type="button"
                    onClick={() => setCodeContexts((prev) => prev.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    aria-label="Remove"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Minimized indicator */}
          {hasMessages && isMinimized && (
            <button
              onClick={handleExpand}
              className="flex items-center gap-2 mb-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
              <span>{messages.length} message{messages.length !== 1 ? 's' : ''} — click to expand</span>
            </button>
          )}

          <AssistantTextArea
            ref={inputRef}
            value={input}
            onChange={setInput}
            onSubmit={handleSubmitAndFocus}
            isLoading={isLoading}
            disabled={(!input.trim() && codeContexts.length === 0) || isLoading}
            shouldFocus={false}
            isMobile={false}
          />
        </div>
      </div>
    </div>
  );
}
