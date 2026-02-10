import {createSignal} from 'solid-js';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/solid';
import draggableIconSrc from '@dnd-kit/stories-shared/assets/draggableIcon.svg';

function DraggableItem() {
  const {isDragging, ref} = useDraggable({id: 'draggable'});

  return (
    <button-component ref={ref} attr:data-shadow={isDragging() ? 'true' : undefined}>
      <img src={draggableIconSrc} alt="Draggable" width={140} draggable={false} style={{"pointer-events": 'none'}} />
    </button-component>
  );
}

function DroppableZone(props: {children?: any}) {
  const {isDropTarget, ref} = useDroppable({id: 'droppable'});

  return (
    <dropzone-component
      ref={ref}
      attr:data-highlight={isDropTarget() ? 'true' : undefined}
    >
      {props.children}
    </dropzone-component>
  );
}

export function DroppableExample() {
  const [parent, setParent] = createSignal<UniqueIdentifier | undefined>();

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setParent(event.operation.target?.id);
      }}
    >
      <section>
        <div style={{display: 'flex', "justify-content": 'center'}}>
          {parent() == null ? <DraggableItem /> : null}
        </div>
        <DroppableZone>
          {parent() === 'droppable' ? <DraggableItem /> : null}
        </DroppableZone>
      </section>
    </DragDropProvider>
  );
}
