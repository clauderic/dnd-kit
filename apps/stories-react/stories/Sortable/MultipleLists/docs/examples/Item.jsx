import React from 'react';
import {useSortable} from '@dnd-kit/react/sortable';

export function Item({id, column, index}) {
  const {ref} = useSortable({
    id,
    index,
    group: column,
    type: 'item',
    accept: ['item'],
  });

  return <button ref={ref}>{id}</button>;
}
