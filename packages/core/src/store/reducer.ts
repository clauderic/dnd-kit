import {omit} from '../utilities';
import {Action, Events} from './actions';
import {State} from './types';

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case Events.RegisterDroppable: {
      const {element} = action;
      const {id} = element;

      return {
        ...state,
        droppableContainers: {
          ...state.droppableContainers,
          [id]: element,
        },
      };
    }

    case Events.SetDroppableDisabled: {
      const {id, disabled} = action;
      const element = state.droppableContainers[id];

      return {
        ...state,
        droppableContainers: {
          ...state.droppableContainers,
          [id]: {
            ...element,
            disabled,
          },
        },
      };
    }

    case Events.UnregisterDroppable: {
      const {id} = action;

      return {
        ...state,
        droppableContainers: omit(id, state.droppableContainers),
      };
    }

    case Events.SetActiveElement: {
      const {id, node} = action;

      return {
        ...state,
        active: {id, node},
      };
    }

    case Events.UnsetActiveElement: {
      return {
        ...state,
        active: null,
      };
    }

    default: {
      return state;
    }
  }
}
