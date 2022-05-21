import {useMemo} from 'react';

import type {SyntheticEventName, UniqueIdentifier} from '../../types';

export type SyntheticListener = {
  eventName: SyntheticEventName;
  handler: (event: React.SyntheticEvent, id: UniqueIdentifier) => void;
};

export type SyntheticListeners = SyntheticListener[];

export type SyntheticListenerMap = Record<string, Function>;

export function useSyntheticListeners(
  listeners: SyntheticListeners,
  id: UniqueIdentifier
): SyntheticListenerMap {
  return useMemo(() => {
    return listeners.reduce<SyntheticListenerMap>(
      (acc, {eventName, handler}) => {
        acc[eventName] = (event: React.SyntheticEvent) => {
          handler(event, id);
        };

        return acc;
      },
      {} as SyntheticListenerMap
    );
  }, [listeners, id]);
}
