import type { JSX } from 'solid-js';

import sortableIcon from '../assets/sortableIcon.svg';

export const SortableIcon = (props: JSX.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src={sortableIcon}
    width="90"
    alt="Sortable"
    draggable={false}
    {...props}
  />
);
