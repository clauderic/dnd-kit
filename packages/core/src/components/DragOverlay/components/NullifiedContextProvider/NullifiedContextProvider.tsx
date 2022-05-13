import React from 'react';
import type {Transform} from '@dnd-kit/utilities';

import {InternalContext, defaultInternalContext} from '../../../../store';
import {ActiveDraggableContext} from '../../../DndContext';

interface Props {
  children: React.ReactNode;
}

const defaultTransform: Transform = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
};

export function NullifiedContextProvider({children}: Props) {
  return (
    <InternalContext.Provider value={defaultInternalContext}>
      <ActiveDraggableContext.Provider value={defaultTransform}>
        {children}
      </ActiveDraggableContext.Provider>
    </InternalContext.Provider>
  );
}
