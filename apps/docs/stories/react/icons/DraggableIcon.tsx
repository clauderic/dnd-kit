import React from 'react';

import draggableIcon from '../../assets/draggableIcon.svg';

export const DraggableIcon = () => (
  <img
    src={draggableIcon}
    width="140"
    alt="Draggable"
    style={{pointerEvents: 'none', userSelect: 'none'}}
  />
);
