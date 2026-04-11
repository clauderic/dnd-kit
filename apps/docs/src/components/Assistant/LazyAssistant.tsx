/**
 * Lazy-loading wrapper for the Assistant.
 * Renders a lightweight placeholder that looks identical to the collapsed
 * assistant. Loads the real AssistantSheet + AssistantProvider only when
 * the user focuses the input or presses ⌘I.
 *
 * The placeholder stays visible during loading to prevent flash — it's
 * hidden only after the real component mounts.
 */
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { ASSISTANT_EVENTS } from './events';

const AssistantSheet = lazy(() =>
  import('./AssistantSheet').then((m) => ({ default: m.AssistantSheet }))
);
const AssistantProvider = lazy(() =>
  import('./AssistantProvider').then((m) => ({ default: m.AssistantProvider }))
);

/**
 * Tiny component that signals when the real assistant has mounted.
 */
function OnMount({ callback }: { callback: () => void }) {
  useEffect(() => { callback(); }, []);
  return null;
}

export function LazyAssistant() {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const activate = useCallback(() => {
    if (!loading && !ready) {
      setLoading(true);
    }
  }, [loading, ready]);

  const handleReady = useCallback(() => {
    setReady(true);
    // Focus the real input after mount
    requestAnimationFrame(() => {
      const input = document.querySelector<HTMLTextAreaElement>(
        '[data-assistant-input]'
      );
      input?.focus();
    });
  }, []);

  // Listen for ⌘I shortcut and assistant:open events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        activate();
      }
    };
    const handleOpen = () => activate();

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener(ASSISTANT_EVENTS.OPEN, handleOpen);
    window.addEventListener(ASSISTANT_EVENTS.TOGGLE, handleOpen);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(ASSISTANT_EVENTS.OPEN, handleOpen);
      window.removeEventListener(ASSISTANT_EVENTS.TOGGLE, handleOpen);
    };
  }, [activate]);

  return (
    <>
      {/* Placeholder — visible until real component is ready */}
      {!ready && <Placeholder onActivate={activate} loading={loading} />}

      {/* Real assistant — loaded on demand, hidden until mounted */}
      {loading && (
        <Suspense fallback={null}>
          <AssistantProvider />
          <AssistantSheet />
          <OnMount callback={handleReady} />
        </Suspense>
      )}
    </>
  );
}

function Placeholder({ onActivate, loading }: { onActivate: () => void; loading: boolean }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-lg print:hidden">
      <div
        className="rounded-2xl overflow-hidden bg-white/80 dark:bg-[#0b0b10]/80 backdrop-blur-xl backdrop-saturate-[180%] border border-gray-300/60 dark:border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <div className="relative flex items-center">
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="absolute left-4 pointer-events-none opacity-40"
          >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          </svg>
          <input
            type="text"
            placeholder={loading ? 'Loading...' : 'Ask a question...'}
            readOnly
            onFocus={onActivate}
            onClick={onActivate}
            className="w-full bg-transparent py-3 pl-11 pr-20 text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none cursor-text"
          />
          <span className="absolute right-11 text-[11px] text-gray-500 dark:text-gray-500 pointer-events-none">⌘I</span>
          <button
            type="button"
            onClick={onActivate}
            className="absolute right-3 p-1 rounded-md text-[var(--primary)] opacity-50 cursor-pointer"
            aria-label="Submit"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 7-7 7 7" /><path d="M12 19V5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
