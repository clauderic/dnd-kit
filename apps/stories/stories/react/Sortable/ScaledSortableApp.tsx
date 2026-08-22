import React, {useState} from 'react';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';

function SortableItem({
  id,
  index,
  group,
}: {
  id: string;
  index: number;
  group: string;
}) {
  const [element, setElement] = useState<Element | null>(null);

  useSortable({id, index, group, element});

  return (
    <div
      ref={setElement}
      className="scaled-item"
      style={{
        marginBlockEnd: 8,
        padding: 16,
        border: '1px solid #999',
        borderRadius: 6,
        background: 'white',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      {id}
    </div>
  );
}

function SortableList({scale}: {scale: number}) {
  const group = `scale-${scale}`;

  return (
    <section>
      <h2>Scale {scale}</h2>
      <div
        className="scaled-list"
        data-scale={scale}
        style={{
          width: 180,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {['A', 'B', 'C', 'D', 'E'].map((item, index) => (
          <SortableItem
            key={item}
            id={`${group}-${item}`}
            index={index}
            group={group}
          />
        ))}
      </div>
    </section>
  );
}

export default function ScaledSortableApp() {
  return (
    <DragDropProvider>
      <main style={{display: 'flex', gap: 160, alignItems: 'flex-start'}}>
        <SortableList scale={1} />
        <SortableList scale={2} />
      </main>
    </DragDropProvider>
  );
}
