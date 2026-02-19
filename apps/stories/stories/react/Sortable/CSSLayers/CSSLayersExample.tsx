import React, {useState, memo, useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';

const LAYER_STYLES = `
@layer base, components;

@layer base {
  .item.layer-item {
    appearance: none;
    padding: 12px 20px;
    border: 2px solid rgb(76, 159, 254);
    border-radius: 8px;
    background: rgb(232, 240, 254);
    color: rgb(26, 58, 92);
    font-size: 15px;
    cursor: grab;
    white-space: nowrap;
    outline: none;
  }
}

@layer components {
  .item.layer-item[data-shadow="true"] {
    opacity: 0.6;
  }
}
`;

export function CSSLayersExample() {
  const [items, setItems] = useState<UniqueIdentifier[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-test-layers', '');
    style.textContent = LAYER_STYLES;
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
          alignItems: 'center',
          gap: 18,
          padding: '0 30px',
        }}
      >
        {items.map((id, index) => (
          <LayerItem key={id} id={id} index={index} />
        ))}
      </div>
    </DragDropProvider>
  );
}

const LayerItem = memo(function LayerItem({
  id,
  index,
}: PropsWithChildren<{id: UniqueIdentifier; index: number}>) {
  const [element, setElement] = useState<Element | null>(null);
  const {isDragging} = useSortable({id, index, element});

  return (
    <button
      ref={setElement}
      className="item layer-item"
      data-shadow={isDragging || undefined}
    >
      Item {id}
    </button>
  );
});
