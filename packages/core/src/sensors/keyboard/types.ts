import type {AnyData} from '../../store/types';
import type {Coordinates, UniqueIdentifier} from '../../types';
import type {SensorContext} from '../types';

export enum KeyboardCode {
  Space = 'Space',
  Down = 'ArrowDown',
  Right = 'ArrowRight',
  Left = 'ArrowLeft',
  Up = 'ArrowUp',
  Esc = 'Escape',
  Enter = 'Enter',
}

export type KeyboardCodes = {
  start: KeyboardEvent['code'][];
  cancel: KeyboardEvent['code'][];
  end: KeyboardEvent['code'][];
};

export type KeyboardCoordinateGetter<
  DraggableData = AnyData,
  DroppableData = AnyData
> = (
  event: KeyboardEvent,
  args: {
    active: UniqueIdentifier;
    currentCoordinates: Coordinates;
    context: SensorContext<DraggableData, DroppableData>;
  }
) => Coordinates | void;
