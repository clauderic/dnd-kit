import React from 'react';

import type {
  Coordinates,
  ViewRect,
  ClientRect,
  LayoutRect,
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
  rect: React.MutableRefObject<LayoutRect | null>;
  disabled: boolean;
  data: React.MutableRefObject<Data>;
}

export type DraggableNode = React.MutableRefObject<HTMLElement | null>;

export type DraggableNodes = Record<
  UniqueIdentifier,
  DraggableNode | undefined
>;

export type DroppableContainers = Record<
  UniqueIdentifier,
  DroppableContainer | undefined
>;

export type LayoutRectMap = Map<UniqueIdentifier, LayoutRect>;

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
  activeNode: HTMLElement | null;
  activeNodeRect: ViewRect | null;
  activeNodeClientRect: ClientRect | null;
  ariaDescribedById: {
    draggable: UniqueIdentifier;
  };
  containerNodeRect: ViewRect | null;
  draggableNodes: DraggableNodes;
  droppableContainers: DroppableContainers;
  droppableRects: LayoutRectMap;
  over: {
    id: UniqueIdentifier;
    rect: LayoutRect;
  } | null;
  overlayNode: {
    nodeRef: React.MutableRefObject<HTMLElement | null>;
    rect: ViewRect | null;
    setRef: (element: HTMLElement | null) => void;
  };
  scrollableAncestors: Element[];
  scrollableAncestorRects: ViewRect[];
  recomputeLayouts(): void;
  willRecomputeLayouts: boolean;
  windowRect: ClientRect | null;
}
