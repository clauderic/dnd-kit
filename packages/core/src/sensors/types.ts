import type {MutableRefObject} from 'react';
import type {
  Active,
  Over,
  DraggableNode,
  DraggableNodes,
  DroppableContainers,
  RectMap,
  AnyData,
} from '../store';
import type {
  Coordinates,
  SyntheticEventName,
  Translate,
  UniqueIdentifier,
  ClientRect,
} from '../types';
import type {Collision} from '../utilities/algorithms';

export enum Response {
  Start = 'start',
  Move = 'move',
  End = 'end',
}

export type SensorContext<DraggableData, DroppableData> = {
  activatorEvent: Event | null;
  active: Active<DraggableData> | null;
  activeNode: HTMLElement | null;
  collisionRect: ClientRect | null;
  collisions: Collision[] | null;
  draggableNodes: DraggableNodes<DraggableData>;
  draggingNode: HTMLElement | null;
  draggingNodeRect: ClientRect | null;
  droppableRects: RectMap;
  droppableContainers: DroppableContainers<DroppableData>;
  over: Over<DroppableData> | null;
  scrollableAncestors: Element[];
  scrollAdjustedTranslate: Translate | null;
};

export type SensorOptions = {};

export interface SensorProps<Options, DraggableData, DroppableData> {
  active: UniqueIdentifier;
  activeNode: DraggableNode<DraggableData>;
  event: Event;
  context: MutableRefObject<SensorContext<DraggableData, DroppableData>>;
  options: Options;
  onStart(coordinates: Coordinates): void;
  onCancel(): void;
  onMove(coordinates: Coordinates): void;
  onEnd(): void;
}

export type SensorInstance = {
  autoScrollEnabled: boolean;
};

export type SensorActivatorFunction<Options, DraggableData> = (
  event: any,
  options: Options,
  context: {
    active: DraggableNode<DraggableData>;
  }
) => boolean | undefined;

export type Activator<Options, DraggableData> = {
  eventName: SyntheticEventName;
  handler: SensorActivatorFunction<Options, DraggableData>;
};

export type Activators<T, DraggableData> = Activator<T, DraggableData>[];

type Teardown = () => void;

export interface Sensor<Options extends Object, DraggableData, DroppableData> {
  new (
    props: SensorProps<Options, DraggableData, DroppableData>
  ): SensorInstance;
  activators: Activators<Options, DraggableData>;
  setup?(): Teardown | undefined;
}

export type Sensors = Sensor<any, AnyData, AnyData>[];

export type SensorDescriptor<
  Options extends Object,
  DraggableData,
  DroppableData
> = {
  sensor: Sensor<Options, DraggableData, DroppableData>;
  options: Options;
};

export type SensorHandler = (
  event: React.SyntheticEvent,
  active: UniqueIdentifier
) => boolean | void;
