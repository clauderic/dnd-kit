import {isSafari} from './isSafari.ts';

/**
 * In Safari, `position: fixed` elements are anchored to the visual viewport
 * during pinch-to-zoom, rather than the layout viewport. Returns the offset
 * needed to compensate for this behavior.
 */
export function getFixedPositionOffset(): {x: number; y: number} {
  const vv = isSafari() ? window.visualViewport : null;

  return {
    x: vv?.offsetLeft ?? 0,
    y: vv?.offsetTop ?? 0,
  };
}
