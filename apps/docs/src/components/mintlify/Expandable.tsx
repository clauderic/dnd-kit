/**
 * Lightweight Expandable using native <details>/<summary>. Zero client JS.
 */
export function Expandable({ title = 'child attributes', defaultOpen, children }: any) {
  return (
    <details className="mt-4 rounded-xl border border-stone-200 dark:border-white/10" open={defaultOpen || undefined}>
      <summary className="not-prose flex w-full cursor-pointer flex-row content-center items-center text-sm rounded-xl px-3.5 py-3 text-stone-600 hover:bg-stone-50/50 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-white/5 dark:hover:text-stone-200 list-none [&::-webkit-details-marker]:hidden">
        <svg width="10" height="10" viewBox="0 0 256 512" fill="currentColor" className="text-stone-400 transition-transform rotate-0 [[open]>&]:rotate-90">
          <path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z" />
        </svg>
        <div className="ml-3 text-left leading-tight">
          <p className="m-0">{title}</p>
        </div>
      </summary>
      <div className="expandable-content mx-3 border-t border-stone-100 px-2 dark:border-white/10">
        {children}
      </div>
    </details>
  );
}
