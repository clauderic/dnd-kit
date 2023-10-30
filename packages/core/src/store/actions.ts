import type {Coordinates, UniqueIdentifier} from '../types';
import type {DroppableContainer} from './types';

export enum Action {
  SetInitiailCoordinates = 'setInitialCoordinates',
  DragMove = 'dragMove',
  ClearCoordinates = 'clearCoordinates',
  DragOver = 'dragOver',
  RegisterDroppable = 'registerDroppable',
  SetDroppableDisabled = 'setDroppableDisabled',
  UnregisterDroppable = 'unregisterDroppable',
}

export type Actions =
  | {
      type: Action.SetInitiailCoordinates;
      initialCoordinates: Coordinates;
    }
  | {type: Action.DragMove; coordinates: Coordinates}
  | {type: Action.ClearCoordinates}
  | {
      type: Action.RegisterDroppable;
      element: DroppableContainer;
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
