import type {Coordinates, UniqueIdentifier} from '../types';
import type {DroppableContainer} from './types';

export enum Action {
  DragStart = 'dragStart',
  DragMove = 'dragMove',
  DragEnd = 'dragEnd',
  DragCancel = 'dragCancel',
  DragOver = 'dragOver',
  RegisterDroppable = 'registerDroppable',
  SetDroppableDisabled = 'setDroppableDisabled',
  UnregisterDroppable = 'unregisterDroppable',
}

export type Actions =
  | {
      type: Action.DragStart;
      active: UniqueIdentifier;
      initialCoordinates: Coordinates;
    }
  | {type: Action.DragMove; coordinates: Coordinates}
  | {type: Action.DragEnd}
  | {type: Action.DragCancel}
  | {
      type: Action.RegisterDroppable;
      element: DroppableContainer;
    }
  | {
      type: Action.SetDroppableDisabled;
      id: UniqueIdentifier;
      disabled: boolean;
    }
  | {
      type: Action.UnregisterDroppable;
      id: UniqueIdentifier;
    };
