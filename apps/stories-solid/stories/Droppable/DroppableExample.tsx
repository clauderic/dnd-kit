import {createSignal, ParentProps} from 'solid-js';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/solid';
import {defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';

import {createRange} from '@/utilities/createRange';
import {Button} from '@/components/Button';
import {Dropzone} from '@/components/Dropzone';
import {DraggableIcon} from '@/components/icons/DraggableIcon';

interface Props {
  droppableCount?: number;
  debug?: boolean;
}

export function DroppableExample(props: Props) {
  const [parent, setParent] = createSignal<UniqueIdentifier | undefined>(undefined);
  const draggable = () => <Draggable id="draggable" />;

  return (
    <DragDropProvider
      plugins={props.debug ? [...defaultPreset.plugins, Debug] : undefined}
      onDragEnd={(event) => {
        const {target} = event.operation;
        if (event.canceled) {
          return;
        }
        setParent(target?.id);
      }}
    >
      <section>
        <div style={{display: 'flex', 'justify-content': 'center'}}>
          {parent() == null ? draggable() : null}
        </div>
        {createRange(props.droppableCount ?? 1).map((id) => (
          <Droppable id={id}>
            {parent() === id ? draggable() : null}
          </Droppable>
        ))}
      </section>
    </DragDropProvider>
  );
}

interface DraggableProps {
  id: UniqueIdentifier;
}

function Draggable(props: DraggableProps) {
  const {isDragging, ref} = useDraggable({
    id: props.id,
  });

  return (
    <Button ref={ref} shadow={isDragging()}>
      <DraggableIcon />
    </Button>
  );
}

interface DroppableProps extends ParentProps {
  id: UniqueIdentifier;
}

function Droppable(props: DroppableProps) {
  const {ref, isDropTarget} = useDroppable({id: props.id});

  return (
    <Dropzone ref={ref} highlight={isDropTarget()}>
      {props.children}
    </Dropzone>
  );
}
