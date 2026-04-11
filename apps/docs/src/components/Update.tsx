/**
 * Lightweight changelog Update component.
 * Replaces @mintlify/components Update to avoid pulling in 227 KiB of JS.
 */
interface UpdateProps {
  label: string;
  description?: string;
  tags?: string[];
  children?: any;
  id?: string;
}

const tagColors: Record<string, string> = {
  major: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  minor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  patch: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
};

export function Update({ label, description, tags, children, id }: UpdateProps) {
  const updateId = id || label?.toLowerCase().replace(/\s+/g, '-') || 'update';

  return (
    <div id={updateId} className="update-container flex flex-col lg:flex-row gap-6 lg:gap-8 pb-10 mb-10 border-b border-gray-200 dark:border-white/10 last:border-0 last:mb-0 last:pb-0">
      <div className="lg:w-[160px] shrink-0 lg:sticky lg:top-24">
        <div className="text-base font-semibold text-[var(--primary)]">{label}</div>
        {tags?.map((tag) => (
          <span
            key={tag}
            className={`inline-block mt-1.5 mr-1.5 px-2 py-0.5 text-xs font-medium rounded-md ${tagColors[tag.toLowerCase()] || tagColors.patch}`}
          >
            {tag}
          </span>
        ))}
        {description && (
          <div className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{description}</div>
        )}
      </div>
      <div className="flex-1 min-w-0 prose dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
}
