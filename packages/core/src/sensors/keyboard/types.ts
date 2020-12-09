import type {Coordinates} from '../../types';
import type {Active} from '../../store';
import type {SensorContext} from '../../components/DndContext';

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

export type CoordinatesGetter = (
  event: KeyboardEvent,
  args: {
    active: Active;
    currentCoordinates: Coordinates;
    context: SensorContext;
  }
) => Coordinates | void;
