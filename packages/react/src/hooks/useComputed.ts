import {useMemo, useRef} from 'react';
import {computed} from '@dnd-kit/state';

import {useSignal} from './useSignal.ts';

export function useComputed<T = any>(
  compute: () => T,
  dependencies: any[] = [],
  sync = false
) {
  const $compute = useRef(compute);
  $compute.current = compute;

  return useSignal(
    useMemo(() => computed(() => $compute.current()), dependencies),
    sync
  );
}
