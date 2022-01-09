import {ContextType, useContext} from 'react';
import {PublicContext} from '../store';

export function useDndContext() {
  return useContext(PublicContext);
}

export type UseDndContextReturnValue = ContextType<typeof PublicContext>;
