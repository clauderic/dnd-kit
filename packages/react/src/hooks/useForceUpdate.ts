import {useCallback, useState} from 'react';

export function useForceUpdate() {
  const setState = useState(0)[1];

  return useCallback(() => {
    setState((value) => value + 1);
  }, [setState]);
}
