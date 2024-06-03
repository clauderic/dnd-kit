import React from 'react';
import {DragDropProvider} from '@dnd-kit/react';

import {Draggable} from './Draggable';

export function Example() {
  return (
    <DragDropProvider>
      <div style={{display: 'inline-flex', flexDirection: 'row', gap: 20}}>
        <Draggable id="draggable-1" />
        <Draggable id="draggable-2" />
        <Draggable id="draggable-3" />
      </div>
    </DragDropProvider>
  );
}
