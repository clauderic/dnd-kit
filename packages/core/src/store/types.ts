import type {MutableRefObject} from 'react';
import type {DeepRequired} from '@dnd-kit/utilities';

import type {SyntheticListeners} from '../hooks/utilities';
import type {Collision} from '../utilities/algorithms';
import type {MeasuringConfiguration} from '../components';
import type {Coordinates, ClientRect, UniqueIdentifier} from '../types';

import type {Actions} from './actions';
import type {DroppableContainersMap} from './constructors';

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

export interface DroppableContainer<DataT extends Data = Data> {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  data: DataRef<DataT>;
  disabled: boolean;
  node: MutableRefObject<HTMLElement | null>;
  rect: MutableRefObject<ClientRect | null>;
}

export interface Active<DataT extends Data = Data> {
  id: UniqueIdentifier;
  data: DataRef<DataT>;
  rect: MutableRefObject<{
    initial: ClientRect | null;
    translated: ClientRect | null;
  }>;
}

export interface Over<DataT extends Data = Data> {
  id: UniqueIdentifier;
  rect: ClientRect;
  disabled: boolean;
  data: DataRef<DataT>;
}

export type DraggableNode<DataT extends Data = Data> = {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  node: MutableRefObject<HTMLElement | null>;
  activatorNode: MutableRefObject<HTMLElement | null>;
  data: DataRef<DataT>;
};

export type DraggableNodes<DataT extends Data = Data> = Map<
  UniqueIdentifier,
  DraggableNode<DataT> | undefined
>;

export type DroppableContainers<DataT extends Data = Data> =
  DroppableContainersMap<DataT>;

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

export interface PublicContextDescriptor<DataT extends Data = Data> {
  activatorEvent: Event | null;
  active: Active<DataT> | null;
  activeNode: HTMLElement | null;
  activeNodeRect: ClientRect | null;
  collisions: Collision[] | null;
  containerNodeRect: ClientRect | null;
  draggableNodes: DraggableNodes<DataT>;
  droppableContainers: DroppableContainers<DataT>;
  droppableRects: RectMap;
  over: Over<DataT> | null;
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

export interface InternalContextDescriptor<DataT extends Data = Data> {
  activatorEvent: Event | null;
  activators: SyntheticListeners;
  active: Active<DataT> | null;
  activeNodeRect: ClientRect | null;
  ariaDescribedById: {
    draggable: string;
  };
  dispatch: React.Dispatch<Actions>;
  draggableNodes: DraggableNodes<DataT>;
  over: Over<DataT> | null;
  measureDroppableContainers(ids: UniqueIdentifier[]): void;
}
