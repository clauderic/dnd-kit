/**
 * Lightweight Tabs component. Minimal client JS for tab switching only.
 */
import { useState, Children, isValidElement } from 'react';

function TabItem({ title, children }: any) {
  return <>{children}</>;
}

function Tabs({ children, defaultTabIndex = 0 }: any) {
  const [activeIndex, setActiveIndex] = useState(defaultTabIndex);
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <div>
      <ul className="not-prose mb-6 flex min-w-full flex-none gap-x-6 overflow-auto border-stone-200 border-b pb-px dark:border-stone-700" role="tablist">
        {items.map((child: any, i: number) => (
          <li key={i} role="tab" aria-selected={i === activeIndex} className="cursor-pointer" onClick={() => setActiveIndex(i)}>
            <div className={`-mb-px flex max-w-max items-center gap-1.5 whitespace-nowrap border-b pt-3 pb-2.5 font-semibold text-sm leading-6 ${
              i === activeIndex
                ? 'border-current text-[var(--primary)]'
                : 'border-transparent text-stone-900 hover:border-stone-300 dark:text-stone-200 dark:hover:border-stone-700'
            }`}>
              {child.props?.title || `Tab ${i + 1}`}
            </div>
          </li>
        ))}
      </ul>
      <div>
        {items.map((child: any, i: number) => (
          <div key={i} role="tabpanel" className={i === activeIndex ? 'prose dark:prose-invert overflow-x-auto' : 'hidden'}>
            {child.props?.children}
          </div>
        ))}
      </div>
    </div>
  );
}

Tabs.Item = TabItem;

export { Tabs };
