import {computed} from '@dnd-kit/state';

import {useConstant} from './useConstant.ts';
import {useSignal} from './useSignal.ts';

export function useComputed<T = any>(compute: () => T, sync = false) {
  return useSignal(
    useConstant(() => computed(compute)),
    sync
  );
}
