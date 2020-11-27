import React from 'react';

import {UniqueIdentifier} from '../types';
import {DroppableContainer} from './types';

export enum Events {
  RegisterDroppable = 'registerDroppable',
  UnregisterDroppable = 'unregisterDroppable',
  SetActiveElement = 'setActiveElement',
  SetNewIndex = 'setNewIndex',
  UnsetActiveElement = 'unsetActiveElement',
}

export type Action =
  | {
      type: Events.RegisterDroppable;
      element: DroppableContainer;
    }
  | {
      type: Events.UnregisterDroppable;
      id: UniqueIdentifier;
    }
  | {
      type: Events.SetActiveElement;
      id: UniqueIdentifier;
      node: React.MutableRefObject<HTMLElement>;
    }
  | {
      type: Events.UnsetActiveElement;
    }
  | {
      type: Events.SetNewIndex;
      newIndex: number;
    };
