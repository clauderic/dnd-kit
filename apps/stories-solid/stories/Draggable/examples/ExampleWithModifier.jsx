import { Draggable } from './Draggable';
import { DragDropProvider } from '@dnd-kit/solid';
import {RestrictToHorizontalAxis} from '@dnd-kit/abstract/modifiers';
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';

export function ExampleWithModifier() {
  return (
    <DragDropProvider modifiers={[RestrictToWindow, RestrictToHorizontalAxis]}>
      <Draggable id="draggable" />
    </DragDropProvider>
  );
}