import type {MutableRefObject} from 'react';
import type {Coordinates, SyntheticEventName} from '../types';
import type {Active} from '../store/types';
import type {SensorContext} from '../components/DraggableContext/DraggableContext';

export enum Response {
  Start = 'start',
  Move = 'move',
  End = 'end',
}

export type SensorOptions = {};

export interface SensorProps<T> {
  active: Active;
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
  active: Active
) => boolean | void;
