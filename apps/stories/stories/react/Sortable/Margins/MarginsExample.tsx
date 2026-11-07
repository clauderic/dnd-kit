import React, {useState, memo, useEffect} from 'react';
import type {CSSProperties} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';

const STYLES = `
.margin-item {
  width: 200px;
  padding: 12px 20px;
  border: 2px solid rgb(76, 159, 254);
  border-radius: 8px;
  background: rgb(232, 240, 254);
  font-size: 15px;
  cursor: grab;
}

.margin-item[data-stylesheet-margin] {
  margin-left: 60px;
}
`;

/**
 * Sortable items that are offset with margins, set either inline or from a
 * stylesheet. The dragged element must stay under the pointer regardless.
 */
export function MarginsExample() {
  const [items, setItems] = useState<UniqueIdentifier[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-test-margins', '');
    style.textContent = STYLES;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 18,
          padding: '20px 30px',
        }}
      >
        {items.map((id, index) => (
          <MarginItem key={id} id={id} index={index} />
        ))}
      </div>
    </DragDropProvider>
  );
}

const MarginItem = memo(function MarginItem({
  id,
  index,
}: {
  id: UniqueIdentifier;
  index: number;
}) {
  const [element, setElement] = useState<Element | null>(null);
  useSortable({id, index, element});

  // Odd items use an inline margin, even items get theirs from the stylesheet
  const inline = Number(id) % 2 === 1;
  const style: CSSProperties | undefined = inline
    ? {marginLeft: 40, marginTop: 10}
    : undefined;

  return (
    <div
      ref={setElement}
      className="margin-item"
      data-stylesheet-margin={inline ? undefined : ''}
      style={style}
    >
      Item {id}
    </div>
  );
});
