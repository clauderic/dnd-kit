/**
 * Custom CodeGroup component — tabbed code blocks.
 *
 * All CodeBlock children are rendered at build time (SSR) with Shiki
 * highlighting. Tab switching is pure CSS — zero JavaScript.
 *
 * DOM order: radios → tab labels → panels
 * CSS uses :has() on .code-group to match checked radio → style tabs + panels.
 */
import { useId, Children, isValidElement, type ReactElement } from 'react';
import { CodeBlock } from './CodeBlock';

interface CodeGroupProps {
  children?: ReactElement | ReactElement[];
}

export function CodeGroup({ children }: CodeGroupProps) {
  const id = useId();
  const blocks = Children.toArray(children).filter(isValidElement) as ReactElement[];

  if (blocks.length === 0) return null;

  return (
    <div className="not-prose code-group my-5 rounded-2xl overflow-hidden border border-white/5">
      {/* Hidden radios at the top — CSS uses .code-group:has(#id:checked) */}
      {blocks.map((_, i) => (
        <input
          key={`r${i}`}
          type="radio"
          name={id}
          id={`${id}-${i}`}
          defaultChecked={i === 0}
          className="sr-only"
          data-tab-index={i}
        />
      ))}

      {/* Tab bar */}
      <div className="code-tabs flex items-center gap-0 bg-[#1e1e1e] border-b border-white/5 overflow-x-auto">
        {blocks.map((block, i) => (
          <label
            key={i}
            htmlFor={`${id}-${i}`}
            className="code-tab px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2 text-white/40 border-transparent hover:text-white/60"
          >
            {block.props?.filename || `Tab ${i + 1}`}
          </label>
        ))}
      </div>

      {/* Panels — all hidden by default, shown via CSS :has(:checked) */}
      {blocks.map((block, i) => (
        <div key={i} className="code-panel" data-panel-index={i}>
          <CodeBlock
            {...block.props}
            filename={undefined}
            isGrouped
          />
        </div>
      ))}
    </div>
  );
}
