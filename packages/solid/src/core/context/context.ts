import {DragDropManager} from '@dnd-kit/dom';
import {createContext} from 'solid-js';

export const DragDropContext = createContext<DragDropManager | null>(null);
