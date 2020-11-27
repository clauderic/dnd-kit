import {CoordinatesGetter, KeyCode, KeyCodes} from './types';

export const defaultKeyCodes: KeyCodes = {
  start: [KeyCode.Space, KeyCode.Enter],
  cancel: [KeyCode.Esc],
  end: [KeyCode.Space, KeyCode.Enter],
};

export const defaultCoordinatesGetter: CoordinatesGetter = (
  event,
  {currentCoordinates}
) => {
  switch (event.code) {
    case KeyCode.Right:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x + 25,
      };
    case KeyCode.Left:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x - 25,
      };
    case KeyCode.Down:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y + 25,
      };
    case KeyCode.Up:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y - 25,
      };
  }

  return undefined;
};
