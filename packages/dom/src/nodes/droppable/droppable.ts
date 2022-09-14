import {
  DragOperationStatus,
  Droppable as AbstractDroppable,
} from '@dnd-kit/abstract';
import type {
  Data,
  DroppableInput as AbstractDroppableInput,
} from '@dnd-kit/abstract';
import {defaultCollisionDetection} from '@dnd-kit/collision';
import type {CollisionDetector} from '@dnd-kit/collision';
import {effect, reactive} from '@dnd-kit/state';

import {DOMRectangle} from '../../shapes';
import type {DragDropManager} from '../../manager';

type OptionalInput = 'collisionDetector';

export interface Input<T extends Data = Data>
  extends Omit<AbstractDroppableInput<T>, OptionalInput> {
  collisionDetector?: CollisionDetector;
}

export class Droppable<T extends Data = Data> extends AbstractDroppable<T> {
  @reactive
  public element: Element | undefined;

  constructor(
    {collisionDetector = defaultCollisionDetection, ...input}: Input<T>,
    manager: DragDropManager
  ) {
    super({...input, collisionDetector});

    effect(() => {
      const {dragOperation} = manager;

      if (dragOperation.status !== DragOperationStatus.Dragging) {
        return;
      }

      this.update();

      if (this.element) {
        return manager.scrollManager.subscribe(this.update);
      }
    });
  }

  private update = () => {
    const {disabled, element} = this;

    this.shape = element && !disabled ? new DOMRectangle(element) : null;
  };
}
