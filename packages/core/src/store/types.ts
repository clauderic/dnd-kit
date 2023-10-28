import type {MutableRefObject} from 'react';
import type {DeepRequired} from '@dnd-kit/utilities';

import type {SyntheticListeners} from '../hooks/utilities';
import type {Collision} from '../utilities/algorithms';
import type {MeasuringConfiguration} from '../components';
import type {Coordinates, ClientRect, UniqueIdentifier} from '../types';

import type {Actions} from './actions';
import type {DroppableContainersMap} from './constructors';
import type {createActiveAndOverAPI} from '../components/DndContext/activeAndOverAPI';

export interface DraggableElement {
  node: DraggableNode;
  id: UniqueIdentifier;
  index: number;
  collection: string;
  disabled: boolean;
}

type AnyData = Record<string, any>;

export type Data<T = AnyData> = T & AnyData;

export type DataRef<T = AnyData> = MutableRefObject<Data<T> | undefined>;

export interface DroppableContainer {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  data: DataRef;
  disabled: boolean;
  node: MutableRefObject<HTMLElement | null>;
  rect: MutableRefObject<ClientRect | null>;
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
}

export type DraggableNode = {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  node: MutableRefObject<HTMLElement | null>;
  activatorNode: MutableRefObject<HTMLElement | null>;
  data: DataRef;
};

export type DraggableNodes = Map<UniqueIdentifier, DraggableNode | undefined>;

export type DroppableContainers = DroppableContainersMap;

export type RectMap = Map<UniqueIdentifier, ClientRect>;

export interface State {
  droppable: {
    containers: DroppableContainers;
  };
  draggable: {
    initialCoordinates: Coordinates | null;
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
  measuringConfiguration: DeepRequired<MeasuringConfiguration>;
  measureDroppableContainers(ids: UniqueIdentifier[]): void;
  measuringScheduled: boolean;
  windowRect: ClientRect | null;
  activeAndOverAPI: ReturnType<typeof createActiveAndOverAPI>;
}

export interface InternalContextDescriptor {
  activators: SyntheticListeners;
  useMyActive: (id: UniqueIdentifier) => Active | null;
  useGloablActive: () => Active | null;
  useMyActiveForDroppable: (droppableId: UniqueIdentifier) => Active | null;
  useMyActivatorEvent: (id: UniqueIdentifier) => Event | null;
  useGlobalActivatorEvent: () => Event | null;
  useMyActiveNodeRect: (id: UniqueIdentifier) => ClientRect | null;
  ariaDescribedById: {
    draggable: string;
  };
  dispatch: React.Dispatch<Actions>;
  draggableNodes: DraggableNodes;
  useMyOverForDraggable: (draggableId: UniqueIdentifier) => Over | null;
  useMyOverForDroppable: (droppableId: UniqueIdentifier) => Over | null;
  measureDroppableContainers(ids: UniqueIdentifier[]): void;
  //this is a temparary solution, since we don't return general active element from useDraggable hook
  //I added this to know if a sortable item is inside an overlay
  isDefaultContext: boolean;
}
