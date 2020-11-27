import React from 'react';

export function combineRefs<T>(
  ...refs: (React.MutableRefObject<T> | React.RefCallback<T> | null)[]
) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    });
  };
}
