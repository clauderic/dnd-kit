import {omit} from '../utilities';
import {Action, Actions} from './actions';
import type {State} from './types';

export function getInitialState(): State {
  return {
    draggable: {
      active: null,
      initialCoordinates: {x: 0, y: 0},
      nodes: {},
      translate: {x: 0, y: 0},
    },
    droppable: {
      containers: {},
    },
  };
}

export function reducer(state: State, action: Actions): State {
  switch (action.type) {
    case Action.DragStart:
      return {
        ...state,
        draggable: {
          ...state.draggable,
          initialCoordinates: action.initialCoordinates,
          active: action.active,
        },
      };
    case Action.DragMove:
      if (!state.draggable.active) {
        return state;
      }

      return {
        ...state,
        draggable: {
          ...state.draggable,
          translate: {
            x: action.coordinates.x - state.draggable.initialCoordinates.x,
            y: action.coordinates.y - state.draggable.initialCoordinates.y,
          },
        },
      };
    case Action.DragEnd:
    case Action.DragCancel:
      return {
        ...state,
        draggable: {
          ...state.draggable,
          active: null,
          initialCoordinates: {x: 0, y: 0},
          translate: {x: 0, y: 0},
        },
      };

    case Action.RegisterDroppable: {
      const {element} = action;
      const {id} = element;

      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers: {
            ...state.droppable.containers,
            [id]: element,
          },
        },
      };
    }

    case Action.SetDroppableDisabled: {
      const {id, disabled} = action;
      const element = state.droppable.containers[id];

      if (!element) {
        return state;
      }

      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers: {
            ...state.droppable.containers,
            [id]: {
              ...element,
              disabled,
            },
          },
        },
      };
    }

    case Action.UnregisterDroppable: {
      const {id} = action;

      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers: omit(id, state.droppable.containers),
        },
      };
    }

    default: {
      return state;
    }
  }
}
