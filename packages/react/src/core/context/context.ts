'use client';

import {createContext} from 'react';
import {DragDropManager} from '@dnd-kit/dom';

export const defaultManager = new DragDropManager();

export const DragDropContext = createContext<DragDropManager | null>(
  defaultManager
);
