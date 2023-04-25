import {create} from 'zustand';
import {defaultInternalContext} from '../context';
import type {InternalContextDescriptor} from '../types';

type State = InternalContextDescriptor;

type Actions = {
  updateState: (payload: State) => void;
};
export type InternalContextStore = State & Actions;

export const useInternalContextStore = create<InternalContextStore>((set) => {
  return {
    ...defaultInternalContext,
    updateState: (payload: State) => {
      set(payload);
    },
  };
});
