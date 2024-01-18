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

export type Actions<DroppableData> =
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
      element: DroppableContainer<DroppableData>;
    }
  | {
      type: Action.SetDroppableDisabled;
      id: UniqueIdentifier;
      key: UniqueIdentifier;
      disabled: boolean;
    }
  | {
      type: Action.UnregisterDroppable;
      id: UniqueIdentifier;
      key: UniqueIdentifier;
    };
