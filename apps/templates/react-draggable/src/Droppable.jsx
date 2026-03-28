import {useDroppable} from '@dnd-kit/react';

export function Droppable({children}) {
  const {isDropTarget, ref} = useDroppable({id: 'droppable'});

  return (
    <div ref={ref} className={isDropTarget ? "droppable active" : "droppable"}>
      {children}
    </div>
  );
}
