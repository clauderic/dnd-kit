import {HTMLProps} from 'react';

import sortableIcon from '@dnd-kit/stories/shared/assets/sortableIcon.svg';

export const SortableIcon = (props: HTMLProps<HTMLImageElement>) => (
  <img
    src={sortableIcon}
    width="90"
    alt="Sortable"
    draggable={false}
    {...props}
  />
);
