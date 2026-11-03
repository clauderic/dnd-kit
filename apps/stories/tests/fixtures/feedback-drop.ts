export {
  DragDropManager,
  Draggable,
  Feedback,
} from '../../../../packages/dom/src/core/index.ts';

declare global {
  interface Window {
    feedbackDropFixture: typeof import('./feedback-drop.ts');
  }
}
