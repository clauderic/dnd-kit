import React, {Profiler, useRef} from 'react';
import {useDroppable, UniqueIdentifier} from '@dnd-kit/core';
import classNames from 'classnames';

import {droppable} from './droppable-svg';
import styles from './Droppable.module.css';

interface Props {
  children: React.ReactNode;
  id: UniqueIdentifier;
  showRenderState?: boolean;
}

export function Droppable({children, id, showRenderState}: Props) {
  const {isOver, setNodeRef} = useDroppable({
    id,
  });

  const span = useRef<HTMLSpanElement>(null);

  const DroppableContent = (
    <div
      ref={setNodeRef}
      data-cypress={`droppable-container-${id}`}
      className={classNames(
        styles.Droppable,
        isOver && styles.over,
        children && styles.dropped
      )}
      aria-label="Droppable region"
    >
      {children}
      {droppable}
    </div>
  );

  return showRenderState ? (
    <Profiler
      id="App"
      onRender={(id, phase) => {
        if (phase === 'update' && span.current) {
          span.current.innerHTML = 'updated';
        }
      }}
    >
      <div>
        <span data-testid={`droppable-status-${id}`} ref={span}>
          mounted
        </span>
        {DroppableContent}
      </div>
    </Profiler>
  ) : (
    DroppableContent
  );
}
