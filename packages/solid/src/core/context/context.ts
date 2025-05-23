import { DragDropManager } from '@dnd-kit/dom';
import { createContext } from 'solid-js';

export const defaultManager = new DragDropManager();

export const DragDropContext = createContext<DragDropManager | null>(
    defaultManager
);
