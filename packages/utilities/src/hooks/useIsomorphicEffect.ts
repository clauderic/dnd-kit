import {useEffect, useLayoutEffect} from 'react';

/**
 * A hook that resolves to useEffect on the server and useLayoutEffect on the client
 * @param callback {function} Callback function that is invoked when the dependencies of the hook change
 */

const useIsomorphicEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export {useIsomorphicEffect};
