/**
 * Custom CodeBlock component.
 *
 * Highlighting runs at build time (SSR) via Shiki. The client only
 * hydrates the copy/Ask AI buttons — no highlighter JS shipped.
 */
import { useState, useMemo, type ReactNode } from 'react';
import { openAssistant } from './Assistant/events';

const SUPPORTED_LANGS = new Set([
  'tsx', 'typescript', 'ts', 'javascript', 'js',
  'json', 'jsonc', 'bash', 'sh', 'shell', 'zsh',
  'css', 'html', 'vue', 'svelte',
]);

function extractCode(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (!children || typeof children !== 'object') return '';

  const child = (children as any)?.props?.children;
  if (typeof child === 'string') return child;
  if (child?.props?.children && typeof child.props.children === 'string') {
    return child.props.children;
  }

  return '';
}

function extractLanguage(className?: string): string {
  if (!className) return 'text';
  const match = className.match(/language-(\w+)/);
  const lang = match?.[1] || 'text';
  return SUPPORTED_LANGS.has(lang) ? lang : 'text';
}

/**
 * SSR-only Shiki highlighter. Initialized once at build time via
 * top-level await. On the client, highlightCode is undefined.
 */
let highlightCode: ((code: string, lang: string, highlight?: string) => string) | undefined;

if (typeof window === 'undefined') {
  const { createHighlighterCoreSync } = await import('shiki/core');
  const { createJavaScriptRegexEngine } = await import('shiki/engine/javascript');
  const { transformerNotationDiff, transformerNotationHighlight } = await import('@shikijs/transformers');
  const monokai = (await import('shiki/themes/monokai.mjs')).default;

  const langs = await Promise.all([
    import('shiki/langs/tsx.mjs'),
    import('shiki/langs/typescript.mjs'),
    import('shiki/langs/javascript.mjs'),
    import('shiki/langs/json.mjs'),
    import('shiki/langs/jsonc.mjs'),
    import('shiki/langs/bash.mjs'),
    import('shiki/langs/css.mjs'),
    import('shiki/langs/html.mjs'),
    import('shiki/langs/vue.mjs'),
    import('shiki/langs/svelte.mjs'),
  ]);

  const highlighter = createHighlighterCoreSync({
    themes: [monokai],
    langs: langs.map(l => l.default),
    engine: createJavaScriptRegexEngine(),
  });

  highlightCode = (code: string, lang: string, highlight?: string) => {
    const transformers: any[] = [
      transformerNotationDiff({
        classLineAdd: 'line-diff line-add',
        classLineRemove: 'line-diff line-remove',
      }),
      transformerNotationHighlight({
        classActiveLine: 'line-highlight',
      }),
    ];

    if (highlight) {
      try {
        const lines = JSON.parse(highlight) as number[];
        if (lines.length) {
          transformers.push({
            name: 'line-highlight-prop',
            line(node: any, line: number) {
              if (lines.includes(line)) {
                (this as any).addClassToHast(node, 'line-highlight');
              }
            },
          });
        }
      } catch {}
    }

    let effectiveLang = lang === 'text' ? 'javascript' : lang;
    if (effectiveLang === 'json' && code.includes('[!code')) {
      effectiveLang = 'jsonc';
    }

    return highlighter.codeToHtml(code, {
      lang: effectiveLang,
      theme: 'monokai',
      transformers,
    });
  };
}

interface CodeBlockProps {
  filename?: string;
  className?: string;
  highlight?: string;
  children?: ReactNode;
  isGrouped?: boolean;
}

export function CodeBlock({
  filename,
  className,
  highlight,
  children,
  isGrouped = false,
}: CodeBlockProps) {
  const code = extractCode(children).replace(/\n$/, '');
  const lang = extractLanguage(className);

  // SSR: highlight with Shiki. Client: empty (HTML preserved by CodeGroup).
  const html = highlightCode ? highlightCode(code, lang, highlight) : '';

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const codeContent = (
    <div className="relative group">
      <div
        className={`overflow-auto text-sm leading-6 bg-[#1e1e1e] ${isGrouped ? '' : 'rounded-2xl'}`}
        style={{ fontVariantLigatures: 'none' }}
        dangerouslySetInnerHTML={{ __html: html }}
        suppressHydrationWarning
      />
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
          onClick={() => openAssistant({ code, language: lang })}
          className="p-1.5 rounded-md text-white/40 hover:text-white/70 cursor-pointer"
          aria-label="Ask AI"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /></svg>
        </button>
      </div>
    </div>
  );

  if (isGrouped) {
    return codeContent;
  }

  if (filename) {
    return (
      <div className="not-prose code-block my-5 rounded-2xl overflow-hidden border border-white/5">
        <div className="flex items-center px-4 py-2 text-xs font-medium text-white/50 bg-[#1e1e1e] border-b border-white/5">
          {filename}
        </div>
        {codeContent}
      </div>
    );
  }

  return (
    <div className="not-prose code-block my-5">
      {codeContent}
    </div>
  );
}
