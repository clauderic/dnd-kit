import React from 'react';

import type {
  Coordinates,
  PositionalClientRect,
  UniqueIdentifier,
} from '../types';
import type {SyntheticListeners} from '../hooks/utilities';
import type {Action, Actions} from './actions';

export interface DraggableElement {
  node: DraggableNode;
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

export type DraggableNode = React.MutableRefObject<HTMLElement | null>;

export type DraggableNodes = Record<UniqueIdentifier, DraggableNode>;

export type DroppableContainers = Record<UniqueIdentifier, DroppableContainer>;

export type PositionalClientRectMap = Map<
  UniqueIdentifier,
  PositionalClientRect
>;

export interface State {
  droppable: {
    containers: DroppableContainers;
  };
  draggable: {
    active: UniqueIdentifier | null;
    initialCoordinates: Coordinates;
    lastEvent: Action.DragStart | Action.DragEnd | Action.DragCancel | null;
    nodes: DraggableNodes;
    translate: Coordinates;
  };
}

export interface DndContextDescriptor {
  dispatch: React.Dispatch<Actions>;
  activators: SyntheticListeners;
  activatorEvent: Event | null;
  active: UniqueIdentifier | null;
  activeNode: DraggableNode | null;
  activeRect: PositionalClientRect | null;
  ariaDescribedById: {
    draggable: UniqueIdentifier;
  };
  cloneNode: {
    nodeRef: React.MutableRefObject<HTMLElement | null>;
    clientRect: PositionalClientRect | null;
    setRef: (element: HTMLElement | null) => void;
  };
  draggableNodes: DraggableNodes;
  droppableContainers: DroppableContainers;
  droppableClientRects: PositionalClientRectMap;
  over: {
    id: UniqueIdentifier;
    clientRect: PositionalClientRect;
  } | null;
  scrollingContainerRect: PositionalClientRect | null;
  recomputeClientRects(): void;
  willRecomputeClientRects: boolean;
}
