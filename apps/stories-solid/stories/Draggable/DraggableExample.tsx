import {DragDropProvider, useDraggable} from '@dnd-kit/solid';
import draggableIconSrc from '@dnd-kit/stories-shared/assets/draggableIcon.svg';

function DraggableItem() {
  const {isDragging, ref} = useDraggable({id: 'draggable'});

  return (
    <button-component ref={ref} data-shadow={isDragging}>
      <img src={draggableIconSrc} alt="Draggable" width={140} draggable={false} style={{"pointer-events": 'none'}} />
    </button-component>
  );
}

export function DraggableExample() {
  return (
    <DragDropProvider>
      <div>
        <DraggableItem />
      </div>
    </DragDropProvider>
  );
}
