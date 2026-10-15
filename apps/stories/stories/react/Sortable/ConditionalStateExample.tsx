import {useState} from 'react';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';

function SortableItem({
  id,
  index,
  showState,
}: {
  id: number;
  index: number;
  showState: boolean;
}) {
  const sortable = useSortable({id, index});

  return (
    <div>
      <button ref={sortable.ref} className="item">
        Item {id}
      </button>
      {showState && (
        <span role="status" aria-label={`Drag state for item ${id}`}>
          {sortable.isDragSource ? 'Dragging' : 'Idle'}
        </span>
      )}
    </div>
  );
}

export function ConditionalStateExample({initiallyShowState = false}) {
  const [showState, setShowState] = useState(initiallyShowState);

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={showState}
          onChange={(event) => setShowState(event.target.checked)}
        />
        Show drag state
      </label>
      <DragDropProvider>
        <div className="list">
          {[1, 2, 3].map((id, index) => (
            <SortableItem
              key={id}
              id={id}
              index={index}
              showState={showState}
            />
          ))}
        </div>
      </DragDropProvider>
    </>
  );
}
