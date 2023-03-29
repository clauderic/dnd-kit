import {Action, Actions} from './actions';
import {DroppableContainersMap} from './constructors';
import type {State} from './types';

export function getInitialState(): State {
  return {
    draggable: {
      initialCoordinates: null,
      translate: {x: 0, y: 0},
    },
    droppable: {
      containers: new DroppableContainersMap(),
    },
  };
}

export function reducer(state: State, action: Actions): State {
  switch (action.type) {
    case Action.SetInitiailCoordinates:
      return {
        ...state,
        draggable: {
          ...state.draggable,
          initialCoordinates: action.initialCoordinates,
        },
      };
    case Action.DragMove:
      if (!state.draggable.initialCoordinates) {
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
    case Action.ClearCoordinates:
      return {
        ...state,
        draggable: {
          ...state.draggable,
          initialCoordinates: {x: 0, y: 0},
          translate: {x: 0, y: 0},
        },
      };

    case Action.RegisterDroppable: {
      const {element} = action;
      const {id} = element;
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.set(id, element);

      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers,
        },
      };
    }

    case Action.SetDroppableDisabled: {
      const {id, key, disabled} = action;
      const element = state.droppable.containers.get(id);

      if (!element || key !== element.key) {
        return state;
      }

      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.set(id, {
        ...element,
        disabled,
      });

      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers,
        },
      };
    }

    case Action.UnregisterDroppable: {
      const {id, key} = action;
      const element = state.droppable.containers.get(id);

      if (!element || key !== element.key) {
        return state;
      }

      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.delete(id);

      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers,
        },
      };
    }

    default: {
      return state;
    }
  }
}
