import {useMemo} from 'react';

import type {SyntheticEventName} from '../../types';

export type SyntheticListener = {
  eventName: SyntheticEventName;
  handler: (
    event: React.SyntheticEvent,
    element: {
      id: string;
      node: React.MutableRefObject<HTMLElement | null>;
    }
  ) => void;
};

export type SyntheticListeners = SyntheticListener[];

export type SyntheticListenerMap = Record<string, Function>;

export function useSyntheticListeners(
  listeners: SyntheticListeners,
  id: string,
  node: React.MutableRefObject<HTMLElement | null>
): SyntheticListenerMap {
  return useMemo(() => {
    return listeners.reduce<SyntheticListenerMap>(
      (acc, {eventName, handler}) => {
        acc[eventName] = (event: React.SyntheticEvent) => {
          handler(event, {
            id,
            node,
          });
        };

        return acc;
      },
      {} as SyntheticListenerMap
    );
  }, [listeners, id, node]);
}
