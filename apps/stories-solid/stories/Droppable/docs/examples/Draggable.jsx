import React from 'react';
import {useDraggable} from '@dnd-kit/react';

export function Draggable({id}) {
  const {ref} = useDraggable({
    id,
  });

  return (
    <button ref={ref}>
      Draggable
    </button>
  );
}
