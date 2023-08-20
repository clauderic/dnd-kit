import React from 'react';
import {useDroppable} from '@dnd-kit/react';

export function Droppable({id, children}) {
  const {ref, isDropTarget} = useDroppable({id});

  return (
    <div ref={ref} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 300,
      height: 300,
      backgroundColor: '##FFF',
      border: '2px solid',
      borderColor: isDropTarget ? 'lightgreen' : 'rgba(0,0,0,0.2)',
      borderRadius: 10,
    }}>
      {children}
    </div>
  );
}
