import {useLazyMemo} from '@dnd-kit/utilities';

export function useInitialValue<T>(value: T | null) {
  return useLazyMemo<T | null>(
    (previousValue) => {
      if (!value) {
        return null;
      }

      if (previousValue) {
        return previousValue;
      }

      return value;
    },
    [value]
  );
}
