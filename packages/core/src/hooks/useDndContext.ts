import {ContextType} from 'react';
import {PublicContext} from '../store';
import {usePublicContextStore} from '../store/new-store';

export function useDndContext(selector?: any) {
  return usePublicContextStore(selector);
}

export type UseDndContextReturnValue = ContextType<typeof PublicContext>;
