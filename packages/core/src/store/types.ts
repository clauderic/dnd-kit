import type {MutableRefObject} from 'react';

import type {Coordinates, ClientRect, UniqueIdentifier} from '../types';
import type {Collision} from '../utilities/algorithms';
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
  rect: MutableRefObject<ClientRect | null>;
  placeholderDraggableId: MutableRefObject<UniqueIdentifier | undefined>;
  placeholderContainerId: MutableRefObject<UniqueIdentifier | undefined>;
}

export interface Active {
  id: UniqueIdentifier;
  data: DataRef;
  rect: MutableRefObject<{
    initial: ClientRect | null;
    translated: ClientRect | null;
  }>;
}

export interface Over {
  id: UniqueIdentifier;
  rect: ClientRect;
  disabled: boolean;
  data: DataRef;
  placeholderId: MutableRefObject<UniqueIdentifier | undefined>;
  placeholderContainerId: MutableRefObject<UniqueIdentifier | undefined>;
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

export type RectMap = Map<UniqueIdentifier, ClientRect>;

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

export interface PublicContextDescriptor {
  activatorEvent: Event | null;
  active: Active | null;
  activeNode: HTMLElement | null;
  activeNodeRect: ClientRect | null;
  collisions: Collision[] | null;
  containerNodeRect: ClientRect | null;
  draggableNodes: DraggableNodes;
  droppableContainers: DroppableContainers;
  droppableRects: RectMap;
  over: Over | null;
  dragOverlay: {
    nodeRef: MutableRefObject<HTMLElement | null>;
    rect: ClientRect | null;
    setRef: (element: HTMLElement | null) => void;
  };
  scrollableAncestors: Element[];
  scrollableAncestorRects: ClientRect[];
  measureDroppableContainers(ids: UniqueIdentifier[]): void;
  measuringScheduled: boolean;
  windowRect: ClientRect | null;
}

export interface InternalContextDescriptor {
  activatorEvent: Event | null;
  activators: SyntheticListeners;
  active: Active | null;
  activeNodeRect: ClientRect | null;
  ariaDescribedById: {
    draggable: UniqueIdentifier;
  };
  dispatch: React.Dispatch<Actions>;
  draggableNodes: DraggableNodes;
  over: Over | null;
  measureDroppableContainers(ids: UniqueIdentifier[]): void;
}
