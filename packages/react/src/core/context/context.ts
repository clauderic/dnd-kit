'use client';

import {createContext} from 'react';
import {DragDropManager} from '@dnd-kit/dom';

export const DragDropContext = createContext<DragDropManager | null>(
  new DragDropManager()
);
