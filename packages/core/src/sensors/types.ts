import type {MutableRefObject} from 'react';
import type {
  DraggableNode,
  DroppableContainers,
  PositionalClientRectMap,
} from '../store';
import type {
  Coordinates,
  PositionalClientRect,
  ScrollCoordinates,
  SyntheticEventName,
  UniqueIdentifier,
} from '../types';

export enum Response {
  Start = 'start',
  Move = 'move',
  End = 'end',
}

export type SensorContext = {
  activeRect: PositionalClientRect | null;
  containerScroll: ScrollCoordinates;
  droppableClientRects: PositionalClientRectMap;
  droppableContainers: DroppableContainers;
  over: {
    id: string;
  } | null;
  scrollingContainer: Element | null;
  windowScroll: ScrollCoordinates;
};

export type SensorOptions = {};

export interface SensorProps<T> {
  active: UniqueIdentifier;
  activeNode: DraggableNode;
  event: Event;
  context: MutableRefObject<SensorContext>;
  options: T;
  onStart(coordinates: Coordinates): void;
  onCancel(): void;
  onMove(coordinates: Coordinates): void;
  onEnd(): void;
}

export type SensorInstance = {
  autoScrollEnabled: boolean;
};

export type Activator<T> = {
  eventName: SyntheticEventName;
  handler(event: React.SyntheticEvent, options: T): boolean | undefined;
};

export type Activators<T> = Activator<T>[];

export interface Sensor<T extends Object> {
  new (props: SensorProps<T>): SensorInstance;
  activators: Activators<T>;
}

export type Sensors = Sensor<any>[];

export type SensorHandler = (
  event: React.SyntheticEvent,
  active: UniqueIdentifier
) => boolean | void;
