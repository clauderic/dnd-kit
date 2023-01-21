import {Context, ContextType, useContext} from 'react';
import {Data, PublicContext, PublicContextDescriptor} from '../store';

export function useDndContext<DataT extends Data = Data>() {
  return useContext(PublicContext as Context<PublicContextDescriptor<DataT>>);
}

export type UseDndContextReturnValue = ContextType<typeof PublicContext>;
