import {create} from 'zustand';
import {getInitialState} from '../reducer';
import type {DroppableContainer, State} from '../types';
import {DroppableContainersMap} from '../constructors';

import type {Coordinates, UniqueIdentifier} from '../../types';

const initialState = getInitialState();

type Actions = {
  dragStart: (payload: DragStartActionPayload) => void;
  dragMove: (payload: DragMoveActionPayload) => void;
  dragEnd: () => void;
  registerDroppable: (payload: RegisterDroppableActionPayload) => void;
  setDroppableDisabled: (payload: SetDroppableDisabledActionPayload) => void;
  unregisterDroppable: (payload: UnregisterDroppableActionPayload) => void;
};
export type DndKitStore = State & Actions;

export const useDndKitStore = create<DndKitStore>((set, get) => {
  return {
    ...initialState,
    dragStart: (payload: DragStartActionPayload) => {
      const state = get();
      set({
        draggable: {
          ...state.draggable,
          initialCoordinates: payload.initialCoordinates,
          active: payload.active,
        },
      });
    },
    dragMove: (payload: DragMoveActionPayload) => {
      const state = get();
      if (!state.draggable.active) {
        return;
      }
      set({
        draggable: {
          ...state.draggable,
          translate: {
            x: payload.coordinates.x - state.draggable.initialCoordinates.x,
            y: payload.coordinates.y - state.draggable.initialCoordinates.y,
          },
        },
      });
    },
    dragEnd: () => {
      const state = get();
      set({
        draggable: {
          ...state.draggable,
          active: null,
          initialCoordinates: {x: 0, y: 0},
          translate: {x: 0, y: 0},
        },
      });
    },
    registerDroppable: (payload: RegisterDroppableActionPayload) => {
      const state = get();
      const {element} = payload;
      const {id} = element;
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.set(id, element);

      set({
        droppable: {
          ...state.droppable,
          containers,
        },
      });
    },
    setDroppableDisabled: (payload: SetDroppableDisabledActionPayload) => {
      const state = get();
      const {id, key, disabled} = payload;
      const element = state.droppable.containers.get(id);

      if (!element || key !== element.key) {
        return;
      }

      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.set(id, {
        ...element,
        disabled,
      });

      set({
        droppable: {
          ...state.droppable,
          containers,
        },
      });
    },
    unregisterDroppable: (payload: UnregisterDroppableActionPayload) => {
      const state = get();
      const {id, key} = payload;
      const element = state.droppable.containers.get(id);

      if (!element || key !== element.key) {
        return;
      }

      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.delete(id);

      set({
        droppable: {
          ...state.droppable,
          containers,
        },
      });
    },
  };
});

type DragStartActionPayload = {
  active: UniqueIdentifier;
  initialCoordinates: Coordinates;
};

type DragMoveActionPayload = {
  coordinates: Coordinates;
};

type RegisterDroppableActionPayload = {
  element: DroppableContainer;
};

type SetDroppableDisabledActionPayload = {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
  disabled: boolean;
};

type UnregisterDroppableActionPayload = {
  id: UniqueIdentifier;
  key: UniqueIdentifier;
};
