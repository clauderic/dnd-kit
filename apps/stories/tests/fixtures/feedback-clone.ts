// Bundle public and private modules together so they share runtime state.
export {
  DragDropManager,
  Draggable,
  Droppable,
} from '../../../../packages/dom/src/core/index.ts';
export {ProxiedElements} from '@dnd-kit/dom/utilities';
export {createPlaceholder} from '../../../../packages/dom/src/core/plugins/feedback/utilities.ts';
export {createElementMutationObserver} from '../../../../packages/dom/src/core/plugins/feedback/observers.ts';

declare global {
  interface Window {
    feedbackFixture: typeof import('./feedback-clone.ts');
  }
}
