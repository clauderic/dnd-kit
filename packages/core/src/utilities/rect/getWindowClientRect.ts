import type {ClientRect} from '../../types';

export function getWindowClientRect(element: typeof window): ClientRect {
  const width = element.innerWidth;
  const height = element.innerHeight;

  return {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
  };
}
