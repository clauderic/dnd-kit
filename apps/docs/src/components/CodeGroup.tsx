/**
 * Custom CodeGroup component — tabbed code blocks.
 *
 * Wraps multiple CodeBlock children as tabs, using the filename
 * prop of each child as the tab label.
 */
import { useState, Children, isValidElement, type ReactElement } from 'react';
import { CodeBlock } from './CodeBlock';

interface CodeGroupProps {
  children?: ReactElement | ReactElement[];
}

export function CodeGroup({ children }: CodeGroupProps) {
  const blocks = Children.toArray(children).filter(isValidElement) as ReactElement[];
  const [selected, setSelected] = useState(0);

  if (blocks.length === 0) return null;

  const tabs = blocks.map((block, i) => {
    const filename = block.props?.filename || `Tab ${i + 1}`;
    return { label: filename, index: i };
  });

  const activeBlock = blocks[selected];

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
      {activeBlock && (
        <CodeBlock
          {...activeBlock.props}
          filename={undefined}
          isGrouped
        />
      )}
    </div>
  );
}
