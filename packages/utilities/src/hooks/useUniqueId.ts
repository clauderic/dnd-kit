import {useMemo} from 'react';

let ids: Record<string, number> = {};

export function useUniqueId(prefix: string, value?: string) {
  return useMemo(() => {
    if (value) {
      return value;
    }

    const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
    ids[prefix] = id;

    return `${prefix}-${id}`;
  }, [prefix, value]);
}
