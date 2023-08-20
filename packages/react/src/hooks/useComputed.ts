import {computed} from '@dnd-kit/state';

import {useConstant} from './useConstant.js';
import {useSignal} from './useSignal.js';

export function useComputed<T = any>(compute: () => T, sync = false) {
  return useSignal(
    useConstant(() => computed(compute)),
    sync
  );
}
