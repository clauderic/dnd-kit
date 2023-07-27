import {useEffect, useLayoutEffect} from 'react';

// https://github.com/facebook/react/blob/master/packages/shared/ExecutionEnvironment.js
export const canUseDOM =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';

/**
 * A hook that resolves to useEffect on the server and useLayoutEffect on the client
 * @param callback {function} Callback function that is invoked when the dependencies of the hook change
 */
export const useIsomorphicLayoutEffect = canUseDOM
  ? useLayoutEffect
  : useEffect;
