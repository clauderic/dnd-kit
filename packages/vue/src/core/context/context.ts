import type {DragDropManager} from '@dnd-kit/dom';
import type {ComputedRef} from 'vue';
import {createContext} from '../../utilities/index.ts';

export const [injectDragDropContext, provideDragDropContext] =
  createContext<ComputedRef<DragDropManager>>('DragDropProvider');
