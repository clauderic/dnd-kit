import type {MutableRefObject} from 'react';
import type {DeepRequired} from '@dnd-kit/utilities';

import type {SyntheticListeners} from '../hooks/utilities';
import type {Collision} from '../utilities/algorithms';
import type {MeasuringConfiguration} from '../components';
import type {Coordinates, ClientRect, UniqueIdentifier} from '../types';

import type {Actions} from './actions';
import type {DroppableContainersMap} from './constructors';

export interface DraggableElement<DraggableData> {
  node: DraggableNode<DraggableData>;
  id: UniqueIdentifier;
  index: number;
  collection: string;
  disabled: boolean;
}

export type AnyData = Record<string, any>;

export type Data<T = AnyData> = T & AnyData;

export type DataRef<T> = MutableRefObject<Data<T> | undefined>;

export interface DroppableContainer<DroppableData = AnyData> {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  data: DataRef<DroppableData>;
  disabled: boolean;
  node: MutableRefObject<HTMLElement | null>;
  rect: MutableRefObject<ClientRect | null>;
}

export interface Active<DraggableData> {
  id: UniqueIdentifier;
  data: DataRef<DraggableData>;
  rect: MutableRefObject<{
    initial: ClientRect | null;
    translated: ClientRect | null;
  }>;
}

export interface Over<DroppableData> {
  id: UniqueIdentifier;
  rect: ClientRect;
  disabled: boolean;
  data: DataRef<DroppableData>;
}

export type DraggableNode<DraggableData> = {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  node: MutableRefObject<HTMLElement | null>;
  activatorNode: MutableRefObject<HTMLElement | null>;
  data: DataRef<DraggableData>;
};

export type DraggableNodes<DraggableData> = Map<
  UniqueIdentifier,
  DraggableNode<DraggableData> | undefined
>;

export type DroppableContainers<DroppableData> =
  DroppableContainersMap<DroppableData>;

export type RectMap = Map<UniqueIdentifier, ClientRect>;

export interface State<DraggableData, DroppableData> {
  droppable: {
    containers: DroppableContainers<DroppableData>;
  };
  draggable: {
    active: UniqueIdentifier | null;
    initialCoordinates: Coordinates;
    nodes: DraggableNodes<DraggableData>;
    translate: Coordinates;
  };
}

export interface PublicContextDescriptor<DraggableData, DroppableData> {
  activatorEvent: Event | null;
  active: Active<DraggableData> | null;
  activeNode: HTMLElement | null;
  activeNodeRect: ClientRect | null;
  collisions: Collision[] | null;
  containerNodeRect: ClientRect | null;
  draggableNodes: DraggableNodes<DraggableData>;
  droppableContainers: DroppableContainers<DroppableData>;
  droppableRects: RectMap;
  over: Over<DroppableData> | null;
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
}

export interface InternalContextDescriptor<DraggableData, DroppableData> {
  activatorEvent: Event | null;
  activators: SyntheticListeners;
  active: Active<DraggableData> | null;
  activeNodeRect: ClientRect | null;
  ariaDescribedById: {
    draggable: string;
  };
  dispatch: React.Dispatch<Actions<DroppableData>>;
  draggableNodes: DraggableNodes<DraggableData>;
  over: Over<DroppableData> | null;
  measureDroppableContainers(ids: UniqueIdentifier[]): void;
}
