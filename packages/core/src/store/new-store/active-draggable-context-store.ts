import {create} from 'zustand';

import type {Transform} from '@schuchertmanagementberatung/dnd-kit-utilities';
import {defaultCoordinates} from '../../utilities';

type State = Transform;

type Actions = {
  updateState: (payload: State) => void;
};
export type ActiveDraggableContextStore = State & Actions;

export const useActiveDraggableContextStore =
  create<ActiveDraggableContextStore>((set) => {
    return {
      ...defaultCoordinates,
      scaleX: 1,
      scaleY: 1,
      updateState: (payload: State) => {
        set({
          ...payload,
        });
      },
    };
  });
