import {computed} from '@dnd-kit/state';

import {useConstant} from './useConstant';
import {useSignal} from './useSignal';

export function useComputed<T = any>(compute: () => T, sync = false) {
  return useSignal(
    useConstant(() => computed(compute)),
    sync
  );
}
