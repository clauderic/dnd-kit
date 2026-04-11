/**
 * Wraps Astro's native <pre> elements (from Shiki) with copy/ask AI buttons.
 * Registered as the `pre` MDX component override so ALL fenced code blocks
 * get interactive features, not just explicit <CodeBlock> components.
 */
import { useState, useRef, type ReactNode } from 'react';
import { openAssistant } from './Assistant/events';

interface PreElementProps {
  children?: ReactNode;
  [key: string]: any;
}

export function PreElement({ children, ...props }: PreElementProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const getCode = () => preRef.current?.textContent || '';

  const getLang = () => {
    const cls = preRef.current?.querySelector('code')?.className || '';
    return cls.match(/language-(\w+)/)?.[1] || 'text';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group not-prose my-5">
      <pre ref={preRef} {...props}>{children}</pre>
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded-md text-white/40 hover:text-white/70 cursor-pointer"
          aria-label="Copy"
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => openAssistant({ code: getCode(), language: getLang() })}
          className="p-1.5 rounded-md text-white/40 hover:text-white/70 cursor-pointer"
          aria-label="Ask AI"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /></svg>
        </button>
      </div>
    </div>
  );
}
