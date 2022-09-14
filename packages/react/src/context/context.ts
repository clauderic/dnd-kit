import {createContext} from 'react';
import {DragDropManager} from '@dnd-kit/dom';

export const DragDropContext = createContext<DragDropManager>(
  new DragDropManager({})
);
