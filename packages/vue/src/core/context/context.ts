import {DragDropManager} from '@dnd-kit/dom';
import {ComputedRef} from 'vue';
import {createContext} from '../../utilities/index.ts';

export const [injectDragDropContext, provideDragDropContext] =
  createContext<ComputedRef<DragDropManager>>('DragDropProvider');
