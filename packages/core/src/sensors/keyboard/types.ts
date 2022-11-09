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

export type KeyboardCodeModifiers = {
  start?: KeyboardEventModifiers | undefined;
  cancel?: KeyboardEventModifiers | undefined;
  end?: KeyboardEventModifiers | undefined;
}

export type KeyboardEventModifiers = {
  altKey?: KeyboardEvent['altKey'] | undefined;
  ctrlKey?: KeyboardEvent['ctrlKey'] | undefined;
  shiftKey?: KeyboardEvent['shiftKey'] | undefined;
}

export type KeyboardCoordinateGetter = (
  event: KeyboardEvent,
  args: {
    active: UniqueIdentifier;
    currentCoordinates: Coordinates;
    context: SensorContext;
  }
) => Coordinates | void;
