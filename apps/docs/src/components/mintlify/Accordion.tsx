/**
 * Lightweight Accordion using native <details>/<summary>. Zero client JS.
 */

// AccordionGroup wraps multiple accordions with shared border styling
function AccordionGroup({ children }: any) {
  return (
    <div className="prose prose-stone dark:prose-invert mt-0 mb-3 overflow-hidden rounded-xl border border-stone-200/70 dark:border-white/10 [&>details+details]:border-t [&>details+details]:border-t-stone-200/70 dark:[&>details+details]:border-t-white/10 [&>details>summary]:rounded-none [&>details]:mb-0 [&>details]:rounded-none [&>details]:border-0">
      {children}
    </div>
  );
}

function Accordion({ title, description, defaultOpen, icon, children }: any) {
  return (
    <details className="accordion mb-3 cursor-default overflow-hidden rounded-2xl border border-stone-200/70 bg-white dark:border-white/10 dark:bg-[#0b0c0e]" open={defaultOpen || undefined}>
      <summary className="not-prose relative flex w-full cursor-pointer list-none flex-row content-center items-center space-x-2 rounded-t-xl px-5 py-4 hover:bg-stone-100 dark:hover:bg-stone-800 [&::-webkit-details-marker]:hidden">
        <div className="mr-2">
          <svg width="12" height="12" viewBox="0 0 256 512" fill="currentColor" className="text-stone-700 dark:text-stone-400 transition rotate-0 [[open]>&]:rotate-90">
            <path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z" />
          </svg>
        </div>
        <div>
          <p className="m-0 font-medium text-stone-900 dark:text-stone-200">{title}</p>
          {description && <p className="m-0 text-sm text-stone-500 dark:text-stone-400">{description}</p>}
        </div>
      </summary>
      <div className="prose prose-stone dark:prose-invert mx-6 mt-2 mb-4 cursor-default overflow-x-auto">
        {children}
      </div>
    </details>
  );
}

Accordion.Group = AccordionGroup;

export { Accordion };
