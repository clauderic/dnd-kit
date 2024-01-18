import {useContext} from 'react';
import type {ContextType, Context} from 'react';
import {PublicContext, PublicContextDescriptor} from '../store';

export function useDndContext<DraggableData, DroppableData>() {
  return useContext(
    PublicContext as Context<
      PublicContextDescriptor<DraggableData, DroppableData>
    >
  );
}

export type UseDndContextReturnValue = ContextType<typeof PublicContext>;
