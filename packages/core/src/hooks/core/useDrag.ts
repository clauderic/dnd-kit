import {useCallback, useReducer} from 'react';

export enum Events {
  Start,
  Move,
  End,
}

type Coordinates = {
  x: number;
  y: number;
};

interface State {
  isDragging: boolean;
  translate: Coordinates;
  initialCoordinates: Coordinates;
}

const initialState: State = {
  isDragging: false,
  initialCoordinates: {x: 0, y: 0},
  translate: {x: 0, y: 0},
};

type Action =
  | {
      type: Events.Start;
      initialCoordinates: State['initialCoordinates'];
    }
  | {type: Events.Move; currentCoordinates: Coordinates}
  | {type: Events.End};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case Events.Start:
      return {
        ...initialState,
        isDragging: true,
        initialCoordinates: action.initialCoordinates,
      };
    case Events.Move:
      if (!state.isDragging) {
        return state;
      }

      return {
        ...state,
        translate: {
          x: action.currentCoordinates.x - state.initialCoordinates.x,
          y: action.currentCoordinates.y - state.initialCoordinates.y,
        },
      };
    case Events.End:
      return initialState;
    default:
      return state;
  }
}

export function useDrag() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleStart = useCallback(
    (initialCoordinates: State['initialCoordinates']) => {
      dispatch({
        type: Events.Start,
        initialCoordinates,
      });
    },
    []
  );

  const handleMove = useCallback((currentCoordinates: Coordinates) => {
    dispatch({
      type: Events.Move,
      currentCoordinates,
    });
  }, []);

  const handleEnd = useCallback(() => {
    dispatch({
      type: Events.End,
    });
  }, []);

  return {
    state,
    handlers: {
      onStart: handleStart,
      onMove: handleMove,
      onEnd: handleEnd,
    },
  };
}
