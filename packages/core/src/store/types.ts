import type {MutableRefObject} from 'react';
import type {Transform} from '@dnd-kit/utilities';

import type {
  Coordinates,
  ViewRect,
  ClientRect,
  LayoutRect,
  UniqueIdentifier,
} from '../types';
import type {SyntheticListeners} from '../hooks/utilities';
import type {Actions} from './actions';
import type {DroppableContainersMap} from './constructors';

export interface DraggableElement {
  node: DraggableNode;
  id: UniqueIdentifier;
  index: number;
  collection: string;
  disabled: boolean;
}

export type Data = Record<string, any>;

export type DataRef = MutableRefObject<Data | undefined>;

export interface DroppableContainer {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  data: DataRef;
  disabled: boolean;
  node: MutableRefObject<HTMLElement | null>;
  rect: MutableRefObject<LayoutRect | null>;
}

export interface Active {
  id: UniqueIdentifier;
  data: DataRef;
  rect: MutableRefObject<{
    initial: ViewRect | null;
    translated: ViewRect | null;
  }>;
}

export interface Over {
  id: UniqueIdentifier;
  rect: LayoutRect;
  disabled: boolean;
  data: DataRef;
}

export type DraggableNode = {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  node: MutableRefObject<HTMLElement | null>;
  data: DataRef;
};

export type DraggableNodes = Record<
  UniqueIdentifier,
  DraggableNode | undefined
>;

export type DroppableContainers = DroppableContainersMap;

export type LayoutRectMap = Map<UniqueIdentifier, LayoutRect>;

export interface State {
  droppable: {
    containers: DroppableContainers;
  };
  draggable: {
    active: UniqueIdentifier | null;
    initialCoordinates: Coordinates;
    nodes: DraggableNodes;
    translate: Coordinates;
  };
}

export interface DndContextDescriptor {
  dispatch: React.Dispatch<Actions>;
  activators: SyntheticListeners;
  activatorEvent: Event | null;
  active: Active | null;
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
  over: Over | null;
  dragOverlay: {
    nodeRef: MutableRefObject<HTMLElement | null>;
    rect: ViewRect | null;
    transform: MutableRefObject<Transform | null>;
    setRef: (element: HTMLElement | null) => void;
  };
  scrollableAncestors: Element[];
  scrollableAncestorRects: ViewRect[];
  recomputeLayouts(): void;
  willRecomputeLayouts: boolean;
  windowRect: ClientRect | null;
}
