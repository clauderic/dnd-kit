import React, {useState} from 'react';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';

const styles = {display: 'inline-flex', flexDirection: 'row', gap: 20};

export function Example() {
  const items = [0, 1, 2, 3];

  return (
    <div style={styles}>
      {items.map((id, index) => (
        <Sortable key={id} id={id} index={index} />
      ))}
    </div>
  );
}

function Sortable({id, index}) {
  const {ref} = useSortable({id, index});

  return <button ref={ref}>Item {id}</button>;
}
