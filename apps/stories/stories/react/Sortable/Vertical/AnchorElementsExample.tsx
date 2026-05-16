import React, {memo, useState} from 'react';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';

const initialItems = [
  {id: 'a', title: 'Documentation', href: 'https://dndkit.com'},
  {id: 'b', title: 'React', href: 'https://react.dev'},
  {id: 'c', title: 'CodePen', href: 'https://codepen.io'},
  {id: 'd', title: 'MDN', href: 'https://developer.mozilla.org'},
];

export function AnchorElementsExample() {
  const [items, setItems] = useState(initialItems);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          padding: '0 30px',
        }}
      >
        {items.map((item, index) => (
          <SortableLink key={item.id} item={item} index={index} />
        ))}
      </div>
    </DragDropProvider>
  );
}

interface SortableLinkProps {
  item: (typeof initialItems)[number];
  index: number;
}

const SortableLink = memo(function SortableLink({
  item,
  index,
}: SortableLinkProps) {
  const [element, setElement] = useState<Element | null>(null);
  const {isDragging} = useSortable({
    id: item.id,
    index,
    element,
  });

  return (
    <a
      ref={setElement}
      href={item.href}
      draggable={false}
      className="Item"
      data-shadow={isDragging}
      style={{
        alignItems: 'flex-start',
        background: '#f4f5f7',
        border: '1px solid #d7dce1',
        borderRadius: 6,
        boxSizing: 'border-box',
        color: '#1f2933',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 16,
        textDecoration: 'none',
        width: 360,
      }}
    >
      <strong>{item.title}</strong>
      <span>{item.href}</span>
    </a>
  );
});
