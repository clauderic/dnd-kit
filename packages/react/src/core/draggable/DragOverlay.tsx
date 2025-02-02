import {useEffect, useRef, type ReactNode} from 'react';
import {useComputed, useDeepSignal} from '@dnd-kit/react/hooks';
import {Draggable, Feedback} from '@dnd-kit/dom';

import {useDragDropManager} from '../hooks/useDragDropManager.ts';

export interface Props {
  className?: string;
  children: ReactNode | ((source: Draggable) => ReactNode);
}

export function DragOverlay({children, className}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const manager = useDragDropManager();
  const source = useComputed(
    () => manager?.dragOperation.source,
    [manager]
  ).value;

  useEffect(() => {
    if (!ref.current || !manager) return;

    const feedback = manager.plugins.find(
      (plugin) => plugin instanceof Feedback
    );

    if (!feedback) return;

    feedback.overlay = ref.current;

    return () => {
      feedback.overlay = undefined;
    };
  }, [manager]);

  return (
    <div className={className} ref={ref} data-dnd-overlay>
      {renderChildren()}
    </div>
  );

  function renderChildren() {
    if (!source) return null;

    if (typeof children === 'function') {
      return <Children source={source}>{children}</Children>;
    }

    return children;
  }
}

function Children({
  children,
  source,
}: {
  children: (source: Draggable) => ReactNode;
  source: Draggable;
}) {
  return children(useDeepSignal(source));
}
