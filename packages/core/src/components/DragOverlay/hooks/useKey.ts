import {useMemo} from 'react';

let key = 0;

export function useKey(id: string | undefined) {
  return useMemo(() => {
    if (id == null) {
      return;
    }

    key++;
    return key;
  }, [id]);
}
