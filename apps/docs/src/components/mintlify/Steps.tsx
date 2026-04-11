/**
 * Lightweight Steps component. Zero client JS.
 * Uses CSS counters for step numbering.
 */
import { Children, isValidElement } from 'react';

function StepItem({ title, titleSize = 'p', icon, children, isLast, stepNumber }: any) {
  const TitleTag = titleSize === 'p' ? 'p' : titleSize;
  const titleClass = titleSize === 'p'
    ? 'prose dark:prose-invert font-semibold mt-2 text-stone-900 dark:text-stone-200'
    : 'mt-2 text-stone-900 dark:text-stone-200';

  return (
    <div className="group/step relative flex items-start pb-5" role="listitem">
      {/* Vertical connecting line */}
      <div
        className={`absolute top-11 h-[calc(100%-2.75rem)] w-px ${
          isLast
            ? 'bg-gradient-to-b from-stone-200 via-stone-200/80 to-transparent dark:from-white/10 dark:via-white/10'
            : 'bg-stone-200/70 dark:bg-white/10'
        }`}
        style={{ left: '0.375rem' }}
      />
      {/* Step number circle */}
      <div className="absolute ml-[-13px] py-2" style={{ left: '0.375rem' }}>
        <div className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-stone-50 font-semibold text-stone-900 text-xs dark:bg-white/10 dark:text-stone-50">
          {stepNumber}
        </div>
      </div>
      {/* Content */}
      <div className="w-full overflow-hidden pr-px pl-8" data-component-part="step-content">
        {title && <TitleTag className={titleClass}>{title}</TitleTag>}
        <div className={`prose dark:prose-invert ${!title ? 'mt-2' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Steps({ children, titleSize }: any) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <div className="mt-10 mb-6 ml-3.5" role="list">
      {items.map((child: any, i: number) => {
        if (child?.type === StepItem || child?.props?.mdxType === 'Step') {
          return { ...child, props: { ...child.props, stepNumber: i + 1, isLast: i === items.length - 1, titleSize: child.props.titleSize || titleSize } };
        }
        return child;
      })}
    </div>
  );
}

Steps.Item = StepItem;

export { Steps };
