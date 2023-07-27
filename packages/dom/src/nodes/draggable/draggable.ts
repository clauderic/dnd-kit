import {
  Draggable as AbstractDraggable,
  DraggableInput,
} from '@dnd-kit/abstract';
import type {Data} from '@dnd-kit/abstract';
import {reactive} from '@dnd-kit/state';

export interface Input<T extends Data = Data> extends DraggableInput<T> {}

export type DraggableFeedback = 'none' | 'clone' | 'move';

export class Draggable<T extends Data = Data> extends AbstractDraggable<T> {
  @reactive
  public activator: Element | undefined;

  @reactive
  public element: Element | undefined;

  @reactive
  public feedback: boolean = true;

  constructor(input: Input<T>) {
    super(input);
  }
}
