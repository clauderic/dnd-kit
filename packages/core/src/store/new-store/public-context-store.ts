import {create} from 'zustand';

import {defaultPublicContext} from '../context';
import type {PublicContextDescriptor} from '../types';

type State = PublicContextDescriptor;

type Actions = {
  updateState: (payload: State) => void;
};
export type PublicContextStore = State & Actions;

export const usePublicContextStore = create<PublicContextStore>((set) => {
  return {
    ...defaultPublicContext,
    updateState: (payload: State) => {
      set({
        ...payload,
      });
    },
  };
});
