/**
 * Custom CodeGroup component — tabbed code blocks.
 *
 * All CodeBlock children are rendered at build time (SSR) with Shiki
 * highlighting. On the client, tab switching uses DOM manipulation to
 * toggle visibility — React never re-renders the code content, so the
 * SSR HTML is preserved.
 */
import { useState, useRef, useEffect, Children, isValidElement, type ReactElement } from 'react';
import { CodeBlock } from './CodeBlock';

interface CodeGroupProps {
  children?: ReactElement | ReactElement[];
}

export function CodeGroup({ children }: CodeGroupProps) {
  const blocks = Children.toArray(children).filter(isValidElement) as ReactElement[];
  const [selected, setSelected] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs = blocks.map((block, i) => ({
    label: block.props?.filename || `Tab ${i + 1}`,
    index: i,
  }));

  // Toggle visibility via DOM instead of React re-render
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const panels = container.querySelectorAll<HTMLElement>('[data-code-panel]');
    panels.forEach((panel, i) => {
      panel.style.display = i === selected ? '' : 'none';
    });
  }, [selected]);

  if (blocks.length === 0) return null;

  return (
    <div className="not-prose code-group my-5 rounded-2xl overflow-hidden border border-white/5">
      <div className="flex items-center gap-0 bg-[#1e1e1e] border-b border-white/5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.index}
            type="button"
            onClick={() => setSelected(tab.index)}
            className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
              tab.index === selected
                ? 'text-white/90 border-primary'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div ref={containerRef}>
        {blocks.map((block, i) => (
          <div
            key={i}
            data-code-panel
            style={{ display: i === selected ? undefined : 'none' }}
          >
            <CodeBlock
              {...block.props}
              filename={undefined}
              isGrouped
            />
          </div>
        ))}
      </div>
    </div>
  );
}
