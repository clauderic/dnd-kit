// Resolve public and private modules together through Vite so the test shares
// their runtime state, including the current development module revision.
export {
  DragDropManager,
  Draggable,
  Droppable,
} from '../../../../packages/dom/src/core/index.ts';
export {ProxiedElements} from '@dnd-kit/dom/utilities';
export {createPlaceholder} from '../../../../packages/dom/src/core/plugins/feedback/utilities.ts';
export {createElementMutationObserver} from '../../../../packages/dom/src/core/plugins/feedback/observers.ts';
