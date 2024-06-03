import React from 'react';
import {useSortable} from '@dnd-kit/react/sortable';

export function Item({id, index}) {
  const {ref} = useSortable({id, index, type: 'item', accept: ['item']});

  return (
    <button ref={ref}>
      {id}
    </button>
  );
}
