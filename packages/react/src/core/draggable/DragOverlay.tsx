import {useEffect, useRef, type ReactNode} from 'react';
import {useComputed} from '@dnd-kit/react/hooks';
import {Draggable, Feedback} from '@dnd-kit/dom';

import {useDragDropManager} from '../hooks/useDragDropManager.ts';

export interface Props {
  className?: string;
  children:
    | ReactNode
    | ((source: Draggable, status: Draggable['status']) => ReactNode);
}

export function DragOverlay({children, className}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const manager = useDragDropManager();
  const source = useComputed(
    () => manager?.dragOperation.source,
    [manager]
  ).value;
  const status = useComputed(() => source?.status, [source]).value;

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
    if (!source || !status) return null;

    return typeof children === 'function' ? children(source, status) : children;
  }
}
