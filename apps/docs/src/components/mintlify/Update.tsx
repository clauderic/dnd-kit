/**
 * Lightweight Update component for the changelog. Zero client JS.
 */
export function Update({ label, description, tags, children, id, isVisible = true }: any) {
  if (!isVisible) return null;

  const updateId = id || label?.toLowerCase().replace(/\s+/g, '-') || 'update';

  return (
    <div id={updateId} className="update-container relative flex w-full flex-col items-start gap-2 py-8 lg:flex-row lg:gap-6">
      <div className="group top-[var(--scroll-mt)] flex w-full shrink-0 flex-col items-start justify-start lg:sticky lg:w-[160px]">
        <div className="flex grow-0 cursor-pointer items-center justify-center rounded-lg bg-[var(--primary)]/10 px-2 py-1 font-medium text-[var(--primary)] text-sm">
          {label}
        </div>
        {tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 px-1 text-stone-500 dark:text-stone-400 text-sm">
            {tags.map((tag: string) => (
              <span key={tag} className="inline-block rounded-lg font-medium text-sm">{tag}</span>
            ))}
          </div>
        )}
        {description && (
          <div className="mt-3 max-w-[160px] px-1 text-stone-500 dark:text-stone-400 text-sm break-words">{description}</div>
        )}
      </div>
      <div className="max-w-full flex-1 overflow-hidden px-0.5">
        <div className="prose-sm">{children}</div>
      </div>
    </div>
  );
}
