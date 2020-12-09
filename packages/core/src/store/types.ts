import React from 'react';

import type {
  Coordinates,
  PositionalClientRect,
  UniqueIdentifier,
} from '../types';
import type {SyntheticListeners} from '../hooks/utilities';
import type {Action, Actions} from './actions';

export interface DraggableElement {
  node: React.MutableRefObject<HTMLElement | null>;
  id: UniqueIdentifier;
  index: number;
  collection: string;
  disabled: boolean;
}

export type Data = Record<string, any>;

export interface DroppableContainer {
  id: UniqueIdentifier;
  node: React.MutableRefObject<HTMLElement | null>;
  clientRect: React.MutableRefObject<PositionalClientRect | null>;
  disabled: boolean;
  data: React.MutableRefObject<Data>;
}

export type DroppableContainers = Record<UniqueIdentifier, DroppableContainer>;

export type PositionalClientRectMap = Map<
  UniqueIdentifier,
  PositionalClientRect
>;

export interface Active {
  node: React.MutableRefObject<HTMLElement>;
  id: UniqueIdentifier;
}

export interface State {
  droppable: {
    containers: DroppableContainers;
  };
  draggable: {
    active: Active | null;
    initialCoordinates: Coordinates;
    translate: Coordinates;
    lastEvent: Action.DragStart | Action.DragEnd | Action.DragCancel | null;
  };
}

export interface DraggableContextType {
  dispatch: React.Dispatch<Actions>;
  activators: SyntheticListeners;
  activatorEvent: Event | null;
  active: Active | null;
  activeRect: PositionalClientRect | null;
  ariaDescribedById: {
    draggable: UniqueIdentifier;
  };
  clientRects: PositionalClientRectMap;
  cloneNode: {
    nodeRef: React.MutableRefObject<HTMLElement | null>;
    clientRect: PositionalClientRect | null;
    setRef: (element: HTMLElement | null) => void;
  };
  droppableContainers: DroppableContainers;
  over: {
    id: UniqueIdentifier;
    clientRect: PositionalClientRect;
  } | null;
  scrollingContainerRect: PositionalClientRect | null;
  recomputeClientRects(): void;
  willRecomputeClientRects: boolean;
}
