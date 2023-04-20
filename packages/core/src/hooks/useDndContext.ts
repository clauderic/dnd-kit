import {ContextType, createContext, useContext} from 'react';
import {PublicContext, PublicContextDescriptor} from '../store';

export function useDndContext() {
  return useContext(PublicContext);
}
const NullContext = createContext<any>(null);

export function useConditionalDndContext(
  condition: boolean
): PublicContextDescriptor | null {
  return useContext(
    condition ? PublicContext : NullContext
  ) as PublicContextDescriptor | null;
}

export type UseDndContextReturnValue = ContextType<typeof PublicContext>;
