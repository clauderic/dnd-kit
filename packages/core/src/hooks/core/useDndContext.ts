import {ContextType, useContext} from 'react';
import {Context} from '../../store';

export function useDndContext() {
  return useContext(Context);
}

export type UseDndContextReturnValue = ContextType<typeof Context>;
